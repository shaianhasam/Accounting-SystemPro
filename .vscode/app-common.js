/* =========================================================
   ACCOUNT PRO
   APP COMMON JS
   Shared logic for Dashboard and Products
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE KEYS
   ========================================================= */

const CURRENT_USER_KEY = "accountProCurrentUser";
const LOGIN_KEY = "accountProLoggedIn";
const PRODUCTS_KEY = "accountProProducts";
const SALES_KEY = "accountProSales";
const DARK_MODE_KEY = "accountProDarkMode";

/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  protectPage();
  loadCurrentUser();
  setupSharedNavigation();
  setupTheme();
  updateNotificationBadge();
  setupNotificationPanel();
});

/* =========================================================
   AUTH PROTECTION
   ========================================================= */

function protectPage() {
  const isLoggedIn = localStorage.getItem(LOGIN_KEY);
  const currentUser = localStorage.getItem(CURRENT_USER_KEY);

  const currentPage = window.location.pathname;

  const isAuthPage =
    currentPage.endsWith("/") ||
    currentPage.endsWith("index.html") ||
    currentPage.endsWith("login.html");

  if (!isAuthPage && (!isLoggedIn || !currentUser)) {
    window.location.href = "index.html";
  }
}

/* =========================================================
   CURRENT USER
   ========================================================= */

function getCurrentUser() {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  } catch (error) {
    console.error("Could not read current user:", error);
    return null;
  }
}

function getUserInitials(name) {
  if (!name) {
    return "U";
  }

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (
    words[0].charAt(0) + words[words.length - 1].charAt(0)
  ).toUpperCase();
}

function loadCurrentUser() {
  const user = getCurrentUser();

  if (!user) {
    return;
  }

  const userNameElements = document.querySelectorAll(
    "#userName, #navbarUserName, [data-user-name]"
  );

  const userRoleElements = document.querySelectorAll(
    "#userRole, #navbarUserRole, [data-user-role]"
  );

  const userAvatarElements = document.querySelectorAll(
    "#userAvatar, #navbarUserAvatar, [data-user-avatar]"
  );

  const fullName =
    user.name ||
    user.fullName ||
    user.username ||
    "User";

  const role =
    user.role ||
    user.userRole ||
    "Admin";

  const initials = getUserInitials(fullName);

  userNameElements.forEach((element) => {
    element.textContent = fullName;
  });

  userRoleElements.forEach((element) => {
    element.textContent = role;
  });

  userAvatarElements.forEach((element) => {
    element.textContent = initials;
  });
}

/* =========================================================
   SHARED NAVIGATION
   ========================================================= */

function setupSharedNavigation() {
  const dashboardLinks = document.querySelectorAll(
    '[data-page="dashboard"], .dashboard-link'
  );

  const productLinks = document.querySelectorAll(
    '[data-page="products"], .products-link'
  );

  dashboardLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "dashboard.html";
    });
  });

  productLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "products.html";
    });
  });

  const currentPage = window.location.pathname;

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");

    const href = item.getAttribute("href");

    if (
      href === "dashboard.html" &&
      currentPage.endsWith("dashboard.html")
    ) {
      item.classList.add("active");
    }

    if (
      href === "products.html" &&
      currentPage.endsWith("products.html")
    ) {
      item.classList.add("active");
    }
  });

  const logoutButtons = document.querySelectorAll(
    "#logoutBtn, .logout-btn, [data-action='logout']"
  );

  logoutButtons.forEach((button) => {
    button.addEventListener("click", logoutUser);
  });

  const mobileMenuButton = document.querySelector(
    "#mobileMenuBtn, .mobile-menu-btn"
  );

  const sidebar = document.querySelector("#sidebar, .sidebar");

  const sidebarOverlay = document.querySelector(
    "#sidebarOverlay, .sidebar-overlay"
  );

  if (mobileMenuButton && sidebar) {
    mobileMenuButton.addEventListener("click", () => {
      sidebar.classList.toggle("show");

      if (sidebarOverlay) {
        sidebarOverlay.classList.toggle("show");
      }
    });
  }

  if (sidebarOverlay && sidebar) {
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("show");
      sidebarOverlay.classList.remove("show");
    });
  }
}

/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(LOGIN_KEY);

  window.location.href = "index.html";
}

/* =========================================================
   DARK MODE
   ========================================================= */

function setupTheme() {
  const savedTheme = localStorage.getItem(DARK_MODE_KEY);

  if (savedTheme === "true") {
    document.body.classList.add("dark-mode");
  }

  const darkModeButtons = document.querySelectorAll(
    "#darkModeBtn, .dark-mode-btn"
  );

  darkModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      const isDarkMode =
        document.body.classList.contains("dark-mode");

      localStorage.setItem(
        DARK_MODE_KEY,
        String(isDarkMode)
      );
    });
  });
}

/* =========================================================
   PRODUCTS DATA
   ========================================================= */

function getProducts() {
  try {
    const products = localStorage.getItem(PRODUCTS_KEY);

    return products ? JSON.parse(products) : [];
  } catch (error) {
    console.error("Could not load products:", error);
    return [];
  }
}

/* =========================================================
   NOTIFICATION BADGE
   ========================================================= */

function updateNotificationBadge() {
  const products = getProducts();

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stockQuantity || 0);
    const lowStockLimit = Number(product.lowStockWarning || 5);

    return stock <= lowStockLimit;
  });

  const notificationCount = document.querySelector(
    "#notificationCount, #notificationBadge"
  );

  if (notificationCount) {
    notificationCount.textContent = lowStockProducts.length;

    if (lowStockProducts.length === 0) {
      notificationCount.classList.add("hidden");
    } else {
      notificationCount.classList.remove("hidden");
    }
  }
}

/* =========================================================
   NOTIFICATION PANEL
   ========================================================= */

function setupNotificationPanel() {
  const notificationButton = document.querySelector(
    "#notificationBtn, .notification-btn"
  );

  const notificationPanel = document.querySelector(
    "#notificationPanel"
  );

  if (!notificationButton || !notificationPanel) {
    return;
  }

  notificationButton.addEventListener("click", () => {
    notificationPanel.classList.toggle("show");
    renderNotifications();
  });

  document.addEventListener("click", (event) => {
    const clickedInsideButton =
      notificationButton.contains(event.target);

    const clickedInsidePanel =
      notificationPanel.contains(event.target);

    if (!clickedInsideButton && !clickedInsidePanel) {
      notificationPanel.classList.remove("show");
    }
  });
}

function renderNotifications() {
  const notificationPanel = document.querySelector(
    "#notificationPanel"
  );

  if (!notificationPanel) {
    return;
  }

  const products = getProducts();

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stockQuantity || 0);
    const lowStockLimit = Number(product.lowStockWarning || 5);

    return stock <= lowStockLimit;
  });

  if (lowStockProducts.length === 0) {
    notificationPanel.innerHTML = `
      <div class="notification-empty">
        <i class="fa-regular fa-circle-check"></i>
        <p>No new notifications</p>
      </div>
    `;

    return;
  }

  notificationPanel.innerHTML = `
    <div class="notification-header">
      <h4>Notifications</h4>
    </div>

    <div class="notification-list">
      ${lowStockProducts
        .map(
          (product) => `
            <div class="notification-item">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <div>
                <strong>${escapeHTML(product.name)}</strong>
                <p>Stock is low: ${product.stockQuantity} items left</p>
              </div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}