// --- LẤY CÁC PHẦN TỬ GIAO DIỆN ---
const secLogin = document.getElementById("sectionLogin");
const secRegister = document.getElementById("sectionRegister");
const btnToRegister = document.getElementById("btnToRegister");
const btnToLogin = document.getElementById("btnToLogin");

// --- LOGIC CHUYỂN ĐỔI FORM ĐĂNG NHẬP / ĐĂNG KÝ ---
btnToRegister.addEventListener("click", () => {
  secLogin.classList.remove("active");
  secRegister.classList.add("active");
});

btnToLogin.addEventListener("click", () => {
  secRegister.classList.remove("active");
  secLogin.classList.add("active");
});

// --- LOGIC XỬ LÝ NÚT BẤM "ĐĂNG KÝ" (GỌI API THỰC TẾ) ---
document
  .getElementById("frmRegister")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const pass = document.getElementById("regPass").value;
    const passConfirm = document.getElementById("regPassConfirm").value;
    const btn = document.getElementById("btnRegSubmit");
    const msg = document.getElementById("successMsg");
    const errMsg = document.getElementById("errorRegMsg");

    if (pass !== passConfirm) {
      errMsg.innerHTML = "❌ Mật khẩu nhập lại không khớp!";
      errMsg.style.display = "block";
      msg.style.display = "none";
      return;
    }

    errMsg.style.display = "none";
    btn.innerHTML = "⏳ Đang xử lý...";
    btn.disabled = true;

    try {
      // Gọi API Đăng ký xuống máy chủ Node.js
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ho_ten: name, email: email, mat_khau: pass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lỗi đăng ký");
      }

      // Nếu thành công
      btn.innerHTML = "Đăng ký";
      btn.disabled = false;
      msg.innerHTML = "✅ " + data.message; // Sẽ hiện dòng: Vui lòng chờ Admin duyệt
      msg.style.display = "block";

      setTimeout(() => {
        msg.style.display = "none";
        document.getElementById("frmRegister").reset();
        btnToLogin.click();
      }, 2000);
    } catch (error) {
      btn.innerHTML = "Đăng ký";
      btn.disabled = false;
      errMsg.innerHTML = "❌ " + error.message;
      errMsg.style.display = "block";
    }
  });

// --- LOGIC XỬ LÝ NÚT BẤM "ĐĂNG NHẬP" (GỌI API THỰC TẾ) ---
document
  .getElementById("frmLogin")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const u = document.getElementById("loginUser").value.trim(); // Đây chính là Email
    const p = document.getElementById("loginPass").value.trim();
    const btn = document.getElementById("btnLoginSubmit");
    const err = document.getElementById("errorMsg");

    btn.innerHTML = "⏳ Đang kiểm tra...";
    btn.disabled = true;
    err.style.display = "none";

    try {
      // Gọi API Đăng nhập xuống máy chủ Node.js
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lỗi đăng nhập");
      }

      // Nếu thành công, lưu thẻ bài (Role) thật từ Database vào LocalStorage
      btn.innerHTML = "Đăng nhập";
      btn.disabled = false;

      // ✅ Lưu token + roles + permissions (RBAC)
      localStorage.setItem("webgis_token", data.token);

      const roles = data.roles || [];
      const perms = data.permissions || [];

      localStorage.setItem("webgis_roles", JSON.stringify(roles));
      localStorage.setItem("webgis_permissions", JSON.stringify(perms));
      // compat (nếu script.js cũ đọc webgis_perms)
      localStorage.setItem("webgis_perms", JSON.stringify(perms));

      localStorage.setItem("webgis_user", data.ho_ten || "");

      // ✅ Giữ key webgis_role cho tương thích code cũ
      const mainRole = roles.includes("admin")
        ? "admin"
        : roles.includes("can_bo")
          ? "can_bo"
          : "guest";
      localStorage.setItem("webgis_role", mainRole);

      window.location.href = "index.html";
    } catch (error) {
      btn.innerHTML = "Đăng nhập";
      btn.disabled = false;
      err.innerHTML = "❌ " + error.message;
      err.style.display = "block";
    }
  });
