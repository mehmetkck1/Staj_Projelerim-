const users = [
  {
    username: "admin",
    email: "admin@sirket.com",
    password: "123",
    role: "Admin",
    status: "Aktif"
  },
  {
    username: "elif.kaya",
    email: "elif.kaya@sirket.com",
    password: "123456",
    role: "Editör",
    status: "Aktif"
  },
  {
    username: "kullanıcı",
    email: "kullanici@sirket.com",
    password: "123",
    role: "Kullanıcı",
    status: "Aktif"
  },
  {
    username: "deniz.arslan",
    email: "deniz.arslan@sirket.com",
    password: "123456",
    role: "Denetçi",
    status: "Aktif"
  }
];

const rolePermissions = {
  Admin: ["Kullanıcı ekleyebilir", "Rol atayabilir", "Tüm panel verilerini görebilir"],
  Editör: ["İçerik düzenleyebilir", "Kendi panelini görüntüleyebilir"],
  Kullanıcı: ["Kendi panelini görüntüleyebilir", "Kendi erişim durumunu takip edebilir"],
  Denetçi: ["Raporları görüntüleyebilir", "Kayıtları inceleyebilir"]
};

const adminNav = [
  { id: "dashboard", label: "Dashboard", title: "Kontrol Paneli", eyebrow: "Dashboard" },
  { id: "users", label: "Kullanıcılar", title: "Kullanıcı Yönetimi", eyebrow: "Kullanıcılar" },
  { id: "roles", label: "Roller", title: "Rol Yönetimi", eyebrow: "Roller" }
];

const userNav = [
  { id: "home", label: "Panelim", title: "Kullanıcı Paneli", eyebrow: "Panelim" }
];

const loginPage = document.getElementById("loginPage");
const panel = document.getElementById("panel");
const loginForm = document.getElementById("loginForm");
const userForm = document.getElementById("userForm");
const roleForm = document.getElementById("roleForm");
const userTable = document.getElementById("userTable");
const roleUser = document.getElementById("roleUser");
const roleSelect = document.getElementById("roleSelect");
const searchInput = document.getElementById("searchInput");
const sessionUser = document.getElementById("sessionUser");
const sessionRole = document.getElementById("sessionRole");
const mainNav = document.getElementById("mainNav");
const pageTitle = document.getElementById("pageTitle");
const pageEyebrow = document.getElementById("pageEyebrow");
const panelMode = document.getElementById("panelMode");
const toast = document.getElementById("toast");

let currentUser = null;
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

function getRoleCounts() {
  return users.reduce((counts, user) => {
    counts[user.role] = (counts[user.role] || 0) + 1;
    return counts;
  }, {});
}

function updateMetrics() {
  const counts = getRoleCounts();
  document.getElementById("totalUsers").textContent = users.length;
  document.getElementById("adminCount").textContent = counts.Admin || 0;
  document.getElementById("editorCount").textContent = counts.Editör || 0;
  document.getElementById("memberCount").textContent = counts.Kullanıcı || 0;
  renderRoleBars(counts);
}

function renderRoleBars(counts) {
  const maxCount = Math.max(...Object.values(counts), 1);
  const bars = ["Admin", "Editör", "Kullanıcı", "Denetçi"]
    .map((role) => {
      const count = counts[role] || 0;
      const width = Math.max((count / maxCount) * 100, count ? 12 : 0);
      return `
        <div class="role-bar">
          <header><span>${role}</span><strong>${count}</strong></header>
          <div><span style="width:${width}%"></span></div>
        </div>
      `;
    })
    .join("");

  document.getElementById("roleBars").innerHTML = bars;
}

function renderRoleOptions() {
  roleUser.innerHTML = users
    .map((user) => `<option value="${user.username}">${user.username}</option>`)
    .join("");

  const selectedUser = users.find((user) => user.username === roleUser.value) || users[0];
  if (selectedUser) {
    roleUser.value = selectedUser.username;
    roleSelect.value = selectedUser.role;
  }
}

function renderUsers() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredUsers = users.filter((user) =>
    [user.username, user.email, user.role].some((value) => value.toLowerCase().includes(query))
  );

  userTable.innerHTML = filteredUsers
    .map(
      (user) => `
        <tr>
          <td>
            <strong>${user.username}</strong><br>
            <small>${user.email}</small>
          </td>
          <td><span class="role-badge">${user.role}</span></td>
          <td><span class="state-dot">${user.status}</span></td>
        </tr>
      `
    )
    .join("");
}

function renderNav(items) {
  mainNav.innerHTML = items
    .map((item, index) => `
      <button class="nav-button ${index === 0 ? "active" : ""}" type="button" data-target="${item.id}">
        ${item.label}
      </button>
    `)
    .join("");
}

function setView(viewId, navItems) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.dataset.view === viewId);
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === viewId);
  });

  const navItem = navItems.find((item) => item.id === viewId);
  if (navItem) {
    pageTitle.textContent = navItem.title;
    pageEyebrow.textContent = navItem.eyebrow;
  }
}

function setupNav(isAdmin) {
  const navItems = isAdmin ? adminNav : userNav;
  renderNav(navItems);

  mainNav.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.target, navItems));
  });

  setView(navItems[0].id, navItems);
}

function refreshAdminPanel() {
  updateMetrics();
  renderRoleOptions();
  renderUsers();
}

function renderUserPanel() {
  const permissions = rolePermissions[currentUser.role] || rolePermissions.Kullanıcı;

  document.getElementById("memberName").textContent = currentUser.username;
  document.getElementById("memberRole").textContent = currentUser.role;
  document.getElementById("memberStatus").textContent = currentUser.status;
  document.getElementById("memberAccess").textContent = currentUser.role === "Admin" ? "Tam" : "Sınırlı";
  document.getElementById("memberPermissions").innerHTML = permissions
    .map((permission) => `<div><span>${currentUser.role}</span><strong>${permission}</strong></div>`)
    .join("");
}

function openPanel(user) {
  const isAdmin = user.role === "Admin";

  currentUser = user;
  sessionUser.textContent = user.username;
  sessionRole.textContent = user.role;
  panelMode.textContent = isAdmin ? "Admin paneli" : "Kullanıcı paneli";

  loginPage.classList.add("hidden");
  panel.classList.remove("hidden");
  setupNav(isAdmin);

  if (isAdmin) {
    refreshAdminPanel();
  } else {
    renderUserPanel();
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("user").value.trim().toLowerCase();
  const password = document.getElementById("pass").value.trim();
  const matchedUser = users.find(
    (user) => user.username.toLowerCase() === username && user.password === password
  );

  if (!matchedUser) {
    showToast("Kullanıcı adı veya şifre hatalı.");
    return;
  }

  openPanel(matchedUser);
  showToast("Giriş başarılı.");
});

userForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("newUsername").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const role = document.getElementById("newRole").value;

  if (!username || !email || password.length < 6) {
    showToast("Kullanıcı bilgilerini kontrol edin.");
    return;
  }

  if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    showToast("Bu kullanıcı adı zaten kayıtlı.");
    return;
  }

  users.unshift({ username, email, password, role, status: "Aktif" });
  userForm.reset();
  document.getElementById("newRole").value = "Kullanıcı";
  refreshAdminPanel();
  showToast(`${username} kullanıcısı oluşturuldu.`);
});

roleForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedUser = users.find((user) => user.username === roleUser.value);
  if (!selectedUser) return;

  selectedUser.role = roleSelect.value;
  refreshAdminPanel();
  roleUser.value = selectedUser.username;
  roleSelect.value = selectedUser.role;
  showToast(`${selectedUser.username} rolü ${selectedUser.role} olarak güncellendi.`);
});

roleUser.addEventListener("change", () => {
  const selectedUser = users.find((user) => user.username === roleUser.value);
  if (selectedUser) roleSelect.value = selectedUser.role;
});

searchInput.addEventListener("input", renderUsers);

document.getElementById("logoutButton").addEventListener("click", () => {
  currentUser = null;
  panel.classList.add("hidden");
  loginPage.classList.remove("hidden");
  loginForm.reset();
  showToast("Oturum kapatıldı.");
});

refreshAdminPanel();
