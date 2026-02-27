const secLogin = document.getElementById("sectionLogin");
const secRegister = document.getElementById("sectionRegister");
const btnToRegister = document.getElementById("btnToRegister");
const btnToLogin = document.getElementById("btnToLogin");

btnToRegister.addEventListener("click", () => {
  secLogin.classList.remove("active");
  secRegister.classList.add("active");
});

btnToLogin.addEventListener("click", () => {
  secRegister.classList.remove("active");
  secLogin.classList.add("active");
});

document.getElementById("frmRegister").addEventListener("submit", function (e) {
  e.preventDefault();
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

  setTimeout(() => {
    btn.innerHTML = "Đăng ký";
    btn.disabled = false;
    msg.style.display = "block";

    setTimeout(() => {
      msg.style.display = "none";
      document.getElementById("frmRegister").reset();
      btnToLogin.click();
    }, 1500);
  }, 800);
});

document.getElementById("frmLogin").addEventListener("submit", function (e) {
  e.preventDefault();
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value.trim();
  const btn = document.getElementById("btnLoginSubmit");
  const err = document.getElementById("errorMsg");

  btn.innerHTML = "⏳ Đang kiểm tra...";
  btn.disabled = true;
  err.style.display = "none";

  setTimeout(() => {
    btn.innerHTML = "Đăng nhập";
    btn.disabled = false;

    if (u === "admin" && p === "admin123") {
      localStorage.setItem("webgis_role", "admin");
      localStorage.setItem("webgis_user", "Quản trị viên");
      window.location.href = "index.html";
    } else if (u === "canbo" && p === "123456") {
      localStorage.setItem("webgis_role", "canbo");
      localStorage.setItem("webgis_user", "Cán bộ Hạt Kiểm lâm");
      window.location.href = "index.html";
    } else {
      err.style.display = "block";
    }
  }, 800);
});
