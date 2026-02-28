// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("./db");

const app = express();

// Nhận XML (WFS-T) + JSON (login/register/admin)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ===== CORS: cho phép cả localhost và 127.0.0.1 (và có thể cấu hình thêm bằng env) =====
const allowedOrigins = new Set(
  (
    process.env.CORS_ORIGINS ||
    process.env.CORS_ORIGIN ||
    "http://localhost:5500,http://127.0.0.1:5500"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Action", "X-Layer"],
  }),
);

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// ===== Helpers RBAC =====
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
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

function requirePerm(code) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    const perms = req.user?.permissions || [];
    if (roles.includes("admin") || perms.includes(code)) return next();
    return res.status(403).json({ message: "Forbidden" });
  };
}

// ===== AUTH =====
app.post("/api/register", async (req, res) => {
  try {
    const { ho_ten, email, mat_khau } = req.body || {};
    if (!ho_ten || !email || !mat_khau)
      return res.status(400).json({ message: "Thiếu dữ liệu" });

    const hash = await bcrypt.hash(mat_khau, 10);

    const insertSql = `
      INSERT INTO public.tai_khoan (ho_ten, email, mat_khau_hash, trang_thai)
      VALUES ($1, $2, $3, 'cho_duyet')
      RETURNING id, ho_ten, email, trang_thai;
    `;
    const { rows } = await pool.query(insertSql, [ho_ten, email, hash]);

    // Tự gán role guest (để admin chỉ cần duyệt)
    await pool.query(
      `INSERT INTO public.tai_khoan_vai_tro(tai_khoan_id, vai_tro_id)
       SELECT $1, id FROM public.vai_tro WHERE ma='guest'
       ON CONFLICT DO NOTHING`,
      [rows[0].id],
    );

    return res.json({
      ok: true,
      message: "Đăng ký thành công. Vui lòng chờ Admin duyệt.",
      user: rows[0],
    });
  } catch (e) {
    if (e.code === "23505" || String(e).includes("duplicate key")) {
      return res
        .status(409)
        .json({ message: "Email đã tồn tại", detail: e.detail, code: e.code });
    }
    console.error("REGISTER_ERROR:", e);
    return res.status(500).json({
      message: "Server error",
      detail: e.message,
      code: e.code || null,
    });
  }
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
    if (!user.mat_khau_hash) {
      return res.status(500).json({
        message: "Tài khoản thiếu mật khẩu (hash)",
        detail:
          "Cột mat_khau_hash đang NULL/undefined. Hãy tạo lại user bằng /api/register hoặc update mat_khau_hash trong DB.",
      });
    }
    const ok = await bcrypt.compare(password, user.mat_khau_hash);
    if (!ok)
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

    const token = signToken(user);
    return res.json({
      ok: true,
      token,
      ho_ten: user.ho_ten,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    });
  } catch (e) {
    console.error("LOGIN_ERROR:", e);
    return res.status(500).json({ message: "Server error", detail: e.message });
  }
});

app.get("/api/me", authRequired, (req, res) =>
  res.json({ ok: true, user: req.user }),
);

// ===== WFS-T Proxy =====
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
  if (!layer || (ALLOWED.size > 0 && !ALLOWED.has(layer))) {
    return res
      .status(400)
      .json({ message: "Layer không hợp lệ hoặc không được phép" });
  }

  const xml = req.body || "";
  if (!xml.includes("<wfs:Transaction") || xml.length < 50) {
    return res.status(400).json({ message: "Body XML không hợp lệ" });
  }

  if (action === "insert" && !xml.includes("<wfs:Insert"))
    return res.status(400).json({ message: "XML không phải Insert" });
  if (action === "update" && !xml.includes("<wfs:Update"))
    return res.status(400).json({ message: "XML không phải Update" });
  if (action === "delete" && !xml.includes("<wfs:Delete"))
    return res.status(400).json({ message: "XML không phải Delete" });

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
    const need = permForAction(action);

    const roles = req.user?.roles || [];
    const perms = req.user?.permissions || [];
    if (!roles.includes("admin") && !perms.includes(need)) {
      return res.status(403).json({ message: "Không đủ quyền" });
    }

    const basic = Buffer.from(
      `${process.env.GEOSERVER_USER}:${process.env.GEOSERVER_PASS}`,
    ).toString("base64");
    const r = await fetch(process.env.GEOSERVER_OWS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/xml", Authorization: `Basic ${basic}` },
      body: xml,
    });

    const text = await r.text();
    return res.status(r.status).send(text);
  } catch (e) {
    console.error("WFST_PROXY_ERROR:", e);
    return res.status(500).json({ message: "Proxy error", detail: e.message });
  }
});

// ===== ADMIN (Quản lý tài khoản) =====
app.get(
  "/api/admin/roles",
  authRequired,
  requirePerm("admin.users"),
  async (req, res) => {
    const { rows } = await pool.query(
      "SELECT id, ma, ten FROM public.vai_tro ORDER BY id ASC",
    );
    return res.json(rows);
  },
);

app.get(
  "/api/admin/users",
  authRequired,
  requirePerm("admin.users"),
  async (req, res) => {
    const sql = `
    SELECT
      tk.id, tk.ho_ten, tk.email, tk.trang_thai, tk.created_at,
      COALESCE(array_agg(DISTINCT vt.ma) FILTER (WHERE vt.ma IS NOT NULL), '{}') AS roles
    FROM public.tai_khoan tk
    LEFT JOIN public.tai_khoan_vai_tro tkvt ON tkvt.tai_khoan_id = tk.id
    LEFT JOIN public.vai_tro vt ON vt.id = tkvt.vai_tro_id
    GROUP BY tk.id
    ORDER BY tk.id ASC;
  `;
    const { rows } = await pool.query(sql);
    return res.json(rows);
  },
);

app.patch(
  "/api/admin/users/:id/status",
  authRequired,
  requirePerm("admin.users"),
  async (req, res) => {
    const id = Number(req.params.id);
    const { trang_thai } = req.body || {};
    if (!["cho_duyet", "hoat_dong", "khoa"].includes(trang_thai)) {
      return res.status(400).json({ message: "trang_thai không hợp lệ" });
    }

    const { rows } = await pool.query(
      "UPDATE public.tai_khoan SET trang_thai=$2 WHERE id=$1 RETURNING id, email, trang_thai",
      [id, trang_thai],
    );
    return res.json({ ok: true, user: rows[0] });
  },
);

app.put(
  "/api/admin/users/:id/roles",
  authRequired,
  requirePerm("admin.users"),
  async (req, res) => {
    const id = Number(req.params.id);
    const roles = (req.body?.roles || []).map(String);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "DELETE FROM public.tai_khoan_vai_tro WHERE tai_khoan_id=$1",
        [id],
      );

      if (roles.length) {
        const r = await client.query(
          "SELECT id, ma FROM public.vai_tro WHERE ma = ANY($1::text[])",
          [roles],
        );
        for (const row of r.rows) {
          await client.query(
            "INSERT INTO public.tai_khoan_vai_tro(tai_khoan_id, vai_tro_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
            [id, row.id],
          );
        }
      }

      await client.query("COMMIT");
      return res.json({ ok: true });
    } catch (e) {
      await client.query("ROLLBACK");
      return res
        .status(500)
        .json({ message: "Server error", detail: e.message });
    } finally {
      client.release();
    }
  },
);

app.delete(
  "/api/admin/users/:id",
  authRequired,
  requirePerm("admin.users"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (req.user?.sub === id)
      return res
        .status(400)
        .json({ message: "Không thể tự xóa tài khoản đang đăng nhập" });

    await pool.query("DELETE FROM public.tai_khoan WHERE id=$1", [id]);
    return res.json({ ok: true });
  },
);

// ===== Start =====
app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ API running at http://localhost:${process.env.PORT || 3000}`);
});
