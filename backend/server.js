console.log("RUNNING FILE:", __filename);
// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("./db");

const app = express();

// Nhận XML (WFS-T) + JSON (login/register)
app.use(
  express.text({
    type: ["text/*", "application/xml", "text/xml"],
    limit: "2mb",
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Action", "X-Layer"],
  }),
);

const JWT_SECRET = process.env.JWT_SECRET;

// ===== RBAC helpers =====
async function getUserRolesPermsByEmail(email) {
  const sql = `
    SELECT
      tk.id,
      tk.ho_ten,
      tk.email,
      tk.trang_thai,
      tk.mat_khau_hash,
      COALESCE(array_agg(DISTINCT vt.ma) FILTER (WHERE vt.ma IS NOT NULL), '{}') AS roles,
      COALESCE(array_agg(DISTINCT q.ma)  FILTER (WHERE q.ma  IS NOT NULL), '{}') AS permissions
    FROM public.tai_khoan tk
    LEFT JOIN public.tai_khoan_vai_tro tkvt ON tkvt.tai_khoan_id = tk.id
    LEFT JOIN public.vai_tro vt            ON vt.id = tkvt.vai_tro_id
    LEFT JOIN public.vai_tro_quyen vtq     ON vtq.vai_tro_id = vt.id
    LEFT JOIN public.quyen q               ON q.id = vtq.quyen_id
    WHERE tk.email = $1
    GROUP BY tk.id;
  `;
  const { rows } = await pool.query(sql, [email]);
  return rows[0] || null;
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    },
    JWT_SECRET,
    { expiresIn: "8h" },
  );
}

function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid/expired token" });
  }
}

// ===== AUTH =====
app.post("/api/register", async (req, res) => {
  try {
    const { ho_ten, email, mat_khau } = req.body || {};
    if (!ho_ten || !email || !mat_khau) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const hash = await bcrypt.hash(mat_khau, 10);

    const insertSql = `
      INSERT INTO public.tai_khoan (ho_ten, email, mat_khau_hash, trang_thai)
      VALUES ($1, $2, $3, 'cho_duyet')
      RETURNING id, ho_ten, email, trang_thai;
    `;
    const { rows } = await pool.query(insertSql, [ho_ten, email, hash]);

    // ✅ Trả message để login.js hiển thị
    return res.json({
      ok: true,
      message: "Đăng ký thành công. Vui lòng chờ Admin duyệt.",
      user: rows[0],
    });
  } catch (e) {
    console.error("REGISTER_ERROR:", e);
    return res.status(500).json({
      message: "Server error",
      detail: e.message,
      code: e.code || null,
    });
  }

  // ✅ Trả thêm detail để biết lỗi thật sự nằm ở đâu (DB name? thiếu table? sai enum?... )
  return res.status(500).json({
    message: "Server error",
    detail: e.message,
    code: e.code,
  });
});
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ message: "Thiếu dữ liệu" });

    const user = await getUserRolesPermsByEmail(username);
    if (!user)
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

    if (user.trang_thai !== "hoat_dong") {
      return res
        .status(403)
        .json({ message: "Tài khoản chưa được duyệt hoặc đã bị khóa" });
    }

    const ok = await bcrypt.compare(password, user.mat_khau_hash);
    if (!ok)
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

    const token = signToken(user);
    res.json({
      ok: true,
      token,
      ho_ten: user.ho_ten,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/me", authRequired, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// ===== WFS-T PROXY =====
const ALLOWED = new Set(
  (process.env.ALLOWED_LAYERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

function validateWfstRequest(req, res, next) {
  const action = (req.headers["x-action"] || "").toString().toLowerCase(); // insert|update|delete
  const layer = (req.headers["x-layer"] || "").toString();

  if (!["insert", "update", "delete"].includes(action)) {
    return res
      .status(400)
      .json({ message: "X-Action phải là insert|update|delete" });
  }
  if (!layer || !ALLOWED.has(layer)) {
    return res
      .status(400)
      .json({ message: "Layer không hợp lệ hoặc không được phép" });
  }

  const xml = req.body || "";
  if (!xml.includes("<wfs:Transaction") || xml.length < 50) {
    return res.status(400).json({ message: "Body XML không hợp lệ" });
  }
  if (action === "insert" && !xml.includes("<wfs:Insert")) {
    return res.status(400).json({ message: "XML không phải Insert" });
  }
  if (action === "update" && !xml.includes("<wfs:Update")) {
    return res.status(400).json({ message: "XML không phải Update" });
  }
  if (action === "delete" && !xml.includes("<wfs:Delete")) {
    return res.status(400).json({ message: "XML không phải Delete" });
  }

  req.wfst = { action, layer, xml };
  next();
}

function permForAction(action) {
  if (action === "insert") return "feature.insert";
  if (action === "update") return "feature.update";
  return "feature.delete";
}

app.post("/api/wfst", authRequired, validateWfstRequest, async (req, res) => {
  try {
    const { action, xml } = req.wfst;
    const needPerm = permForAction(action);

    const perms = req.user.permissions || [];
    if (!perms.includes(needPerm)) {
      return res.status(403).json({ message: "Không đủ quyền" });
    }

    const basic = Buffer.from(
      `${process.env.GEOSERVER_USER}:${process.env.GEOSERVER_PASS}`,
    ).toString("base64");
    const r = await fetch(process.env.GEOSERVER_OWS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        Authorization: `Basic ${basic}`,
      },
      body: xml,
    });

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Proxy error" });
  }
});

// ===== Start =====
app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ API running at http://localhost:${process.env.PORT || 3000}`);
});
