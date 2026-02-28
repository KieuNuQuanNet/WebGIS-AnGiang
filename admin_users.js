const API_BASE = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("webgis_token") || "";
}
function getRoles() {
  try {
    return JSON.parse(localStorage.getItem("webgis_roles") || "[]");
  } catch {
    return [];
  }
}
function getPerms() {
  try {
    return JSON.parse(
      localStorage.getItem("webgis_permissions") ||
        localStorage.getItem("webgis_perms") ||
        "[]",
    );
  } catch {
    return [];
  }
}

function isAdmin() {
  const roles = getRoles();
  const perms = getPerms();
  return roles.includes("admin") || perms.includes("admin.users");
}

async function api(path, opts = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    if (res.status === 401) {
      // token hết hạn / sai -> đá về login
      [
        "webgis_token",
        "webgis_roles",
        "webgis_permissions",
        "webgis_perms",
        "webgis_role",
        "webgis_user",
      ].forEach((k) => localStorage.removeItem(k));
      window.location.href = "login.html";
      return;
    }
    const msg = typeof data === "object" ? data.message || text : text;
    throw new Error(msg);
  }

  return data;
}

function badgeStatus(status) {
  if (status === "hoat_dong")
    return `<span class="badge badge-ok">Hoạt động</span>`;
  if (status === "cho_duyet")
    return `<span class="badge badge-warn">Chờ duyệt</span>`;
  return `<span class="badge badge-off">Khóa</span>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = getToken();
  if (!token) return (window.location.href = "login.html");
  if (!isAdmin()) return (window.location.href = "index.html");

  const helloUser = document.getElementById("helloUser");
  if (helloUser) {
    helloUser.textContent = `Xin chào, ${localStorage.getItem("webgis_user") || "Admin"}!`;
  }

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.onclick = () => {
      [
        "webgis_token",
        "webgis_roles",
        "webgis_permissions",
        "webgis_perms",
        "webgis_role",
        "webgis_user",
      ].forEach((k) => localStorage.removeItem(k));
      window.location.href = "login.html";
    };
  }

  const btnReload = document.getElementById("btnReload");
  if (btnReload) btnReload.onclick = () => loadData();

  await loadData();
});

let rolesMaster = [];

async function loadData() {
  const msg = document.getElementById("msg");
  if (msg) {
    msg.className = "msg";
    msg.textContent = "";
  }

  try {
    rolesMaster = await api("/api/admin/roles");
    const users = await api("/api/admin/users");

    const totalUsers = document.getElementById("totalUsers");
    const pendingUsers = document.getElementById("pendingUsers");
    if (totalUsers) totalUsers.textContent = users.length;
    if (pendingUsers)
      pendingUsers.textContent = users.filter(
        (u) => u.trang_thai === "cho_duyet",
      ).length;

    renderTable(users);
  } catch (e) {
    if (msg) {
      msg.className = "msg show";
      msg.textContent = "❌ " + e.message;
    }
  }
}

function renderTable(users) {
  const tbody = document.getElementById("tbodyUsers");
  if (!tbody) return;
  tbody.innerHTML = "";

  users.forEach((u, idx) => {
    const roleValue = u.roles && u.roles.length ? u.roles[0] : "guest";

    const roleOptions = rolesMaster
      .map(
        (r) =>
          `<option value="${r.ma}" ${r.ma === roleValue ? "selected" : ""}>${r.ten}</option>`,
      )
      .join("");

    const statusOptions = `
      <option value="hoat_dong" ${u.trang_thai === "hoat_dong" ? "selected" : ""}>Hoạt động</option>
      <option value="cho_duyet" ${u.trang_thai === "cho_duyet" ? "selected" : ""}>Chờ duyệt</option>
      <option value="khoa" ${u.trang_thai === "khoa" ? "selected" : ""}>Khóa</option>
    `;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><b>${u.ho_ten || ""}</b></td>
      <td>${u.email || ""}</td>
      <td><select data-id="${u.id}" class="selRole">${roleOptions}</select></td>
      <td>
        <select data-id="${u.id}" class="selStatus">${statusOptions}</select>
        <div style="margin-top:6px">${badgeStatus(u.trang_thai)}</div>
      </td>
      <td>
        <div class="row-actions">
          <button class="btn btn-small btnSave" data-id="${u.id}">💾 Lưu</button>
          <button class="btn btn-small btn-danger btnDel" data-id="${u.id}">🗑 Xóa</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".btnSave").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-id");
      const role = tbody.querySelector(`.selRole[data-id="${id}"]`).value;
      const status = tbody.querySelector(`.selStatus[data-id="${id}"]`).value;

      btn.disabled = true;
      try {
        await api(`/api/admin/users/${id}/roles`, {
          method: "PUT",
          body: JSON.stringify({ roles: [role] }),
        });
        await api(`/api/admin/users/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ trang_thai: status }),
        });
        await loadData();
        alert("✅ Đã lưu thay đổi!");
      } catch (e) {
        alert("❌ " + e.message);
      } finally {
        btn.disabled = false;
      }
    };
  });

  tbody.querySelectorAll(".btnDel").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Bạn chắc chắn muốn xóa tài khoản này?")) return;

      btn.disabled = true;
      try {
        await api(`/api/admin/users/${id}`, { method: "DELETE" });
        await loadData();
        alert("✅ Đã xóa!");
      } catch (e) {
        alert("❌ " + e.message);
      } finally {
        btn.disabled = false;
      }
    };
  });
}
