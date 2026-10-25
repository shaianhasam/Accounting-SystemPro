/* =========================================================
   ACCOUNT PRO - SETTINGS SCRIPT
   ========================================================= */

(function () {
    "use strict";

    function startSettings() {

        const $ = (id) => document.getElementById(id);

        function safeParse(value, fallback) {
            try {
                const parsed = JSON.parse(value);
                return parsed ?? fallback;
            } catch {
                return fallback;
            }
        }

        const KEYS = {
            loggedIn: "accountProLoggedIn",
            currentUser: "accountProCurrentUser",
            users: "accountProUsers",
            productsStore: "accountProProductsByUser",
            salesStore: "accountProSalesByUser",
            notificationsStore: "accountProNotificationsByUser",
            activitiesStore: "accountProActivitiesByUser",
            currencyStore: "accountProCurrencyByUser",
            theme: "dashboardTheme"
        };

        const loggedIn = localStorage.getItem(KEYS.loggedIn);
        const currentUser = safeParse(localStorage.getItem(KEYS.currentUser), null);

        if (loggedIn !== "true" || !currentUser) {
            window.location.href = "index.html";
            return;
        }

        function getUserId(user) {
            if (!user) return "guest";
            const raw = user.id ?? user.uid ?? user.userId ?? user.email ?? user.username ?? user.fullName ?? user.name ?? "guest";
            return String(raw).trim().toLowerCase();
        }

        const uid = getUserId(currentUser);

        function getUserArray(storeKey, userId) {
            const store = safeParse(localStorage.getItem(storeKey), {});
            const arr = store[userId];
            return Array.isArray(arr) ? arr : [];
        }

        function setUserArray(storeKey, userId, value) {
            const store = safeParse(localStorage.getItem(storeKey), {});
            store[userId] = Array.isArray(value) ? value : [];
            try {
                localStorage.setItem(storeKey, JSON.stringify(store));
            } catch (error) {
                console.error("Cannot save localStorage:", error);
            }
        }


        /* =================================================
           LOAD USER & TOPBAR (Name, Avatar, Tooltip)
        ================================================= */

        function loadUser() {
            const nameEl = $("navbar-user-name");
            const avatarEl = $("user-avatar");
            const fullName = String(currentUser.fullName || currentUser.name || "Admin User").trim();

            if (nameEl) nameEl.textContent = fullName;

            const tipEl = $("user-tooltip");
            if (tipEl) tipEl.textContent = fullName + " · Finance Admin";

            const navUser = document.querySelector(".navbar-user");
            if (navUser) {
                navUser.addEventListener("click", function (event) {
                    event.stopPropagation();
                    navUser.classList.toggle("show-tooltip");
                });
                document.addEventListener("click", function () {
                    navUser.classList.remove("show-tooltip");
                });
            }

            if (avatarEl) {
                const parts = fullName.split(/\s+/).filter(Boolean);
                let initials = "U";
                if (parts.length >= 2) initials = parts[0][0] + parts[1][0];
                else if (parts.length === 1) initials = parts[0][0];
                avatarEl.textContent = initials.toUpperCase();
            }
        }

        loadUser();


        /* =================================================
           NOTIFICATIONS
        ================================================= */

        function loadNotifications() {
            const list = $("notification-list");
            const count = $("notification-count");
            if (!list) return;

            const notifications = getUserArray(KEYS.notificationsStore, uid);
            const unread = notifications.filter(n => !n.read);

            if (count) {
                count.textContent = unread.length;
                count.classList.toggle("show", unread.length > 0);
            }

            if (notifications.length === 0) {
                list.innerHTML = `<div class="no-notifications">No notifications</div>`;
                return;
            }

            list.innerHTML = notifications.slice(0, 8).map((n, index) => {
                const date = n.date ? new Date(n.date).toLocaleString() : "";
                return `
                    <div class="notification-item ${n.read ? "" : "unread"}" data-index="${index}">
                        <div class="notification-title">${String(n.title || "Notification")}</div>
                        <div class="notification-message">${String(n.message || "")}</div>
                        <div class="notification-date">${date}</div>
                    </div>
                `;
            }).join("");

            list.querySelectorAll(".notification-item").forEach(item => {
                item.addEventListener("click", function () {
                    const index = Number(item.dataset.index);
                    if (notifications[index]) {
                        notifications[index].read = true;
                        setUserArray(KEYS.notificationsStore, uid, notifications);
                        loadNotifications();
                    }
                });
            });
        }

        const notificationBtn = $("notification-btn");
        const notificationPanel = $("notification-panel");

        if (notificationBtn && notificationPanel) {
            notificationBtn.addEventListener("click", function (event) {
                event.stopPropagation();
                notificationPanel.classList.toggle("show");
            });

            document.addEventListener("click", function (event) {
                if (!notificationPanel.contains(event.target) && !notificationBtn.contains(event.target)) {
                    notificationPanel.classList.remove("show");
                }
            });
        }

        const markAllRead = $("mark-all-read");
        if (markAllRead) {
            markAllRead.addEventListener("click", function () {
                const notifications = getUserArray(KEYS.notificationsStore, uid);
                notifications.forEach(n => { n.read = true; });
                setUserArray(KEYS.notificationsStore, uid, notifications);
                loadNotifications();
            });
        }

        loadNotifications();


        /* =================================================
           MOBILE SIDEBAR & LOGOUT & THEME
        ================================================= */

        const sidebar = $("sidebar");
        const mobileMenu = $("mobile-menu");

        if (sidebar && mobileMenu) {
            mobileMenu.addEventListener("click", function (event) {
                event.stopPropagation();
                sidebar.classList.toggle("open");
            });

            document.addEventListener("click", function (event) {
                if (window.innerWidth <= 800 && sidebar.classList.contains("open") && !sidebar.contains(event.target) && !mobileMenu.contains(event.target)) {
                    sidebar.classList.remove("open");
                }
            });
        }

        const logoutBtn = $("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                if (!confirm("Are you sure you want to logout?")) return;
                localStorage.removeItem(KEYS.loggedIn);
                localStorage.removeItem(KEYS.currentUser);
                window.location.href = "index.html";
            });
        }

        const darkModeBtn = $("dark-mode-btn");
        const themeIcon = $("theme-icon");

        function applyTheme() {
            const dark = localStorage.getItem(KEYS.theme) === "dark";
            document.body.classList.toggle("dark", dark);
            if (themeIcon) themeIcon.className = dark ? "fa-regular fa-moon" : "fa-regular fa-sun";
        }

        applyTheme();

        if (darkModeBtn) {
            darkModeBtn.addEventListener("click", function () {
                const dark = !document.body.classList.contains("dark");
                document.body.classList.toggle("dark", dark);
                localStorage.setItem(KEYS.theme, dark ? "dark" : "light");
                if (themeIcon) themeIcon.className = dark ? "fa-regular fa-moon" : "fa-regular fa-sun";
            });
        }


        /* =================================================
           SETTINGS TABS & FORMS LOGIC
        ================================================= */

        const tabs = document.querySelectorAll(".settings-tab");
        const panels = document.querySelectorAll(".settings-panel");

        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                panels.forEach(p => p.classList.remove("active"));

                tab.classList.add("active");
                const targetPanel = $(tab.dataset.tab);
                if (targetPanel) targetPanel.classList.add("active");
            });
        });

        function loadSettingsData() {
            $("st-fullname").value = currentUser.fullName || currentUser.name || "";
            $("st-email").value = currentUser.email || "";
            $("st-bizname").value = currentUser.businessName || currentUser.business || "";
            $("st-phone").value = currentUser.phone || "";
            $("st-address").value = currentUser.address || "";

            const currStore = safeParse(localStorage.getItem(KEYS.currencyStore), {});
            const currentCurrency = currStore[uid] === "AFN" ? "AFN" : "USD";

            const radio = document.querySelector(`input[name="currency-opt"][value="${currentCurrency}"]`);
            if (radio) radio.checked = true;
        }

        const profileForm = $("profile-form");
        if (profileForm) {
            profileForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const fullName = $("st-fullname").value.trim();
                const password = $("st-password").value;

                if (!fullName) {
                    alert("Please enter your full name.");
                    return;
                }

                if (password && password.length < 8) {
                    alert("Password must be at least 8 characters.");
                    return;
                }

                currentUser.fullName = fullName;
                if (password) currentUser.password = password;

                localStorage.setItem(KEYS.currentUser, JSON.stringify(currentUser));

                const users = safeParse(localStorage.getItem(KEYS.users), []);
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex].fullName = fullName;
                    if (password) users[userIndex].password = password;
                    localStorage.setItem(KEYS.users, JSON.stringify(users));
                }

                alert("Profile updated successfully!");
                location.reload();
            });
        }

        const businessForm = $("business-form");
        if (businessForm) {
            businessForm.addEventListener("submit", (e) => {
                e.preventDefault();
                currentUser.businessName = $("st-bizname").value.trim();
                currentUser.phone = $("st-phone").value.trim();
                currentUser.address = $("st-address").value.trim();

                localStorage.setItem(KEYS.currentUser, JSON.stringify(currentUser));
                alert("Business information saved!");
            });
        }

        document.querySelectorAll('input[name="currency-opt"]').forEach(radio => {
            radio.addEventListener("change", function () {
                const currStore = safeParse(localStorage.getItem(KEYS.currencyStore), {});
                currStore[uid] = this.value;
                localStorage.setItem(KEYS.currencyStore, JSON.stringify(currStore));
                alert("Currency updated!");
            });
        });

        const exportBtn = $("btn-export-json");
        if (exportBtn) {
            exportBtn.addEventListener("click", () => {
                const productsStore = getUserArray(KEYS.productsStore, uid);
                const salesStore = getUserArray(KEYS.salesStore, uid);

                const backupData = {
                    account: currentUser.email,
                    exportDate: new Date().toISOString(),
                    products: productsStore,
                    sales: salesStore
                };

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `AccountPro_Backup_${uid}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            });
        }

        const resetBtn = $("btn-reset-data");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                if (confirm("Are you sure you want to clear all products and sales? This cannot be undone.")) {
                    setUserArray(KEYS.productsStore, uid, []);
                    setUserArray(KEYS.salesStore, uid, []);
                    alert("Data cleared successfully.");
                    window.location.href = "dashboard.html";
                }
            });
        }

        loadSettingsData();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startSettings);
    } else {
        startSettings();
    }
})();

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const mobileBtn = document.getElementById("mobile-menu");

    if (!sidebar || !mobileBtn) return;

    // ساخت لایه تاریک پشت سایدبار
    let overlay = document.querySelector(".mobile-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "mobile-overlay";
        document.body.appendChild(overlay);
    }

    // باز و بسته کردن سایدبار با کلیک روی دکمه هومبرگر
    mobileBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        sidebar.classList.toggle("open");
        overlay.classList.toggle("show");
    });

    // بستن سایدبار با کلیک روی فضای تاریک بیرون
    overlay.addEventListener("click", function () {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const mobileBtn = document.getElementById("mobile-menu");

    if (!sidebar || !mobileBtn) return;

    // بررسی و ساخت لایه تاریک پشت سایدبار
    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
    }

    // باز و بسته کردن منو با دکمه همبرگری
    mobileBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });

    // بستن کامل منو و لایه تاریک با یک کلیک روی بخش سایه
    overlay.addEventListener("click", function () {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });
});