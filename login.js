// login.js - phiên bản giữ nguyên giao diện (không đụng CSS/HTML), chỉ sửa logic JWT/RBAC
const API_BASE = "http://localhost:3000";

const secLogin = document.getElementById("sectionLogin");
const secRegister = document.getElementById("sectionRegister");
const btnToRegister = document.getElementById("btnToRegister");
const btnToLogin = document.getElementById("btnToLogin");

const frmLogin = document.getElementById("frmLogin");
const frmRegister = document.getElementById("frmRegister");

const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");
const errorRegMsg = document.getElementById("errorRegMsg");

function show(el, msg) {
  if (!el) return;
  el.style.display = "block";
  if (typeof msg === "string") el.innerHTML = msg;
}
function hide(el) {
  if (!el) return;
  el.style.display = "none";
}

function gotoRegister() {
  secLogin?.classList.remove("active");
  secRegister?.classList.add("active");
  hide(errorMsg);
  hide(successMsg);
  hide(errorRegMsg);
}

function gotoLogin() {
  secRegister?.classList.remove("active");
  secLogin?.classList.add("active");
  hide(errorMsg);
  hide(successMsg);
  hide(errorRegMsg);
}

// Nếu đã có token thì không ở lại trang login
if (localStorage.getItem("webgis_token")) {
  window.location.href = "index.html";
}

// Toggle
btnToRegister?.addEventListener("click", (e) => {
  e.preventDefault?.();
  gotoRegister();
});

btnToLogin?.addEventListener("click", (e) => {
  e.preventDefault?.();
  gotoLogin();
});

// REGISTER
frmRegister?.addEventListener("submit", async (e) => {
  e.preventDefault();
  hide(successMsg);
  hide(errorRegMsg);

  const ho_ten = document.getElementById("regName")?.value.trim() || "";
  const email = document.getElementById("regEmail")?.value.trim() || "";
  const mat_khau = document.getElementById("regPass")?.value || "";
  const mat_khau2 = document.getElementById("regPassConfirm")?.value || "";
  const btn = document.getElementById("btnRegSubmit");

  if (mat_khau !== mat_khau2) {
    show(errorRegMsg, "❌ Mật khẩu nhập lại không khớp!");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "⏳ Đang xử lý...";
  }

  try {
    const r = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ho_ten, email, mat_khau }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || "Lỗi đăng ký");

    show(
      successMsg,
      "✅ " + (data.message || "Đăng ký thành công. Vui lòng chờ Admin duyệt."),
    );
    frmRegister.reset();

    setTimeout(() => {
      hide(successMsg);
      gotoLogin();
    }, 1200);
  } catch (err) {
    show(errorRegMsg, "❌ " + (err.message || err));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "Đăng ký";
    }
  }
});

// LOGIN
frmLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();
  hide(errorMsg);

  const username = document.getElementById("loginUser")?.value.trim() || "";
  const password = document.getElementById("loginPass")?.value || "";
  const btn = document.getElementById("btnLoginSubmit");

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "⏳ Đang kiểm tra...";
  }

  try {
    const r = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || "Lỗi đăng nhập");

    // ✅ Lưu token + roles + permissions
    localStorage.setItem("webgis_token", data.token);
    localStorage.setItem("webgis_roles", JSON.stringify(data.roles || []));
    localStorage.setItem(
      "webgis_permissions",
      JSON.stringify(data.permissions || []),
    );
    localStorage.setItem(
      "webgis_perms",
      JSON.stringify(data.permissions || []),
    ); // compat
    localStorage.setItem("webgis_user", data.ho_ten || "");

    // compat role cũ
    const roles = (data.roles || []).map((x) => (x || "").toLowerCase());
    const mainRole = roles.includes("admin")
      ? "admin"
      : roles.includes("can_bo")
        ? "can_bo"
        : "guest";
    localStorage.setItem("webgis_role", mainRole);

    window.location.href = "index.html";
  } catch (err) {
    show(errorMsg, "❌ " + (err.message || err));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "Đăng nhập";
    }
  }
});
