/* =========================================================
   ACCOUNT PRO
   DASHBOARD.JS
   LOCAL STORAGE VERSION - PER ACCOUNT DATA
   ========================================================= */

(function () {
    "use strict";

    function startDashboard() {

        console.log("AccountPro Dashboard started");

        /* =================================================
           HELPERS
        ================================================= */

        const $ = (id) => document.getElementById(id);

        function safeParse(value, fallback) {
            try {
                const parsed = JSON.parse(value);
                return parsed ?? fallback;
            } catch {
                return fallback;
            }
        }

        function money(value) {
            const amount = Number(value) || 0;

            return amount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            });
        }

        function num(value) {
            return (Number(value) || 0).toLocaleString("en-US");
        }

        function setText(id, value) {
            const el = $(id);
            if (el) el.textContent = value;
        }

        function escapeHTML(value) {
            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function getDate(value) {
            if (!value) return null;
            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? null : date;
        }


        /* =================================================
           LOCAL STORAGE KEYS
           ---------------------------------------------------
           Products / sales / notifications / activities are
           now stored per-account. Each "*Store" key holds an
           OBJECT keyed by the current user's unique id:

           accountProProductsByUser = {
               "user_1@mail.com": [ ...products ],
               "user_2@mail.com": [ ...products ]
           }

           This replaces the old single global arrays
           ("products", "sales") that were shared by every
           account.
        ================================================= */

        const KEYS = {
            loggedIn: "accountProLoggedIn",
            currentUser: "accountProCurrentUser",

            productsStore: "accountProProductsByUser",
            salesStore: "accountProSalesByUser",
            notificationsStore: "accountProNotificationsByUser",
            activitiesStore: "accountProActivitiesByUser",

            migrated: "accountProDataMigrated",

            theme: "dashboardTheme"
        };


        /* =================================================
           AUTH
        ================================================= */

        const loggedIn = localStorage.getItem(KEYS.loggedIn);

        const currentUser = safeParse(
            localStorage.getItem(KEYS.currentUser),
            null
        );

        if (loggedIn !== "true" || !currentUser) {
            window.location.href = "index.html";
            return;
        }


        /* =================================================
           ACCOUNT ID
           A reliable, stable identifier for the logged-in
           account. Falls back gracefully depending on what
           the login/signup system actually stored.
        ================================================= */

        function getUserId(user) {

            if (!user) return "guest";

            const raw =
                user.id ??
                user.uid ??
                user.userId ??
                user.email ??
                user.username ??
                user.fullName ??
                user.name ??
                "guest";

            return String(raw).trim().toLowerCase();
        }

        const uid = getUserId(currentUser);


        /* =================================================
           PER-ACCOUNT STORE HELPERS
        ================================================= */

        function getStore(storeKey) {
            const store = safeParse(localStorage.getItem(storeKey), {});
            return (store && typeof store === "object" && !Array.isArray(store))
                ? store
                : {};
        }

        function saveStore(storeKey, store) {
            try {
                localStorage.setItem(storeKey, JSON.stringify(store));
            } catch (error) {
                console.error("Cannot save localStorage:", error);
            }
        }

        function getUserArray(storeKey, userId) {
            const store = getStore(storeKey);
            const arr = store[userId];
            return Array.isArray(arr) ? arr : [];
        }

        function setUserArray(storeKey, userId, value) {
            const store = getStore(storeKey);
            store[userId] = Array.isArray(value) ? value : [];
            saveStore(storeKey, store);
        }


        /* =================================================
           ONE-TIME MIGRATION FROM OLD GLOBAL STORAGE
           ---------------------------------------------------
           Older versions of this app saved one shared
           "products" / "sales" array for every account. The
           first account to load the app after this update
           claims that legacy data (since it was created by
           whoever was testing/using the app), then the flag
           is set so no other account ever receives it again.
        ================================================= */

        function migrateLegacyData() {

            if (localStorage.getItem(KEYS.migrated) === "true") {
                return;
            }

            const legacyProducts = safeParse(localStorage.getItem("products"), null);
            const legacySales = safeParse(localStorage.getItem("sales"), null);
            const legacyNotifications = safeParse(localStorage.getItem("accountProNotifications"), null);
            const legacyActivities = safeParse(localStorage.getItem("accountProActivities"), null);

            if (Array.isArray(legacyProducts) && legacyProducts.length) {
                setUserArray(KEYS.productsStore, uid, legacyProducts);
            }

            if (Array.isArray(legacySales) && legacySales.length) {
                setUserArray(KEYS.salesStore, uid, legacySales);
            }

            if (Array.isArray(legacyNotifications) && legacyNotifications.length) {
                setUserArray(KEYS.notificationsStore, uid, legacyNotifications);
            }

            if (Array.isArray(legacyActivities) && legacyActivities.length) {
                setUserArray(KEYS.activitiesStore, uid, legacyActivities);
            }

            localStorage.setItem(KEYS.migrated, "true");
        }

        migrateLegacyData();


        /* =================================================
           USER
        ================================================= */

        function loadUser() {

            const nameEl = $("navbar-user-name");
            const avatarEl = $("user-avatar");
            const greetingEl = $("greeting");

            const fullName = String(
                currentUser.fullName ||
                currentUser.name ||
                "Admin User"
            ).trim();

            if (nameEl) nameEl.textContent = fullName;

            if (avatarEl) {

                const parts = fullName.split(/\s+/).filter(Boolean);
                let initials = "U";

                if (parts.length >= 2) {
                    initials = parts[0][0] + parts[1][0];
                } else if (parts.length === 1) {
                    initials = parts[0][0];
                }

                avatarEl.textContent = initials.toUpperCase();
            }

            if (greetingEl) {

                const hour = new Date().getHours();
                let greeting = "Good night";

                if (hour >= 5 && hour < 12) greeting = "Good morning";
                else if (hour >= 12 && hour < 18) greeting = "Good afternoon";
                else if (hour >= 18 && hour < 22) greeting = "Good evening";

                greetingEl.textContent = `${greeting}, ${fullName}`;
            }
        }

        loadUser();


        /* =================================================
           INITIAL LOCAL DATA (per account, empty by default)
        ================================================= */

        function initializeStorage() {

            const productsStore = getStore(KEYS.productsStore);
            if (!Array.isArray(productsStore[uid])) {
                productsStore[uid] = [];
                saveStore(KEYS.productsStore, productsStore);
            }

            const salesStore = getStore(KEYS.salesStore);
            if (!Array.isArray(salesStore[uid])) {
                salesStore[uid] = [];
                saveStore(KEYS.salesStore, salesStore);
            }

            const notificationsStore = getStore(KEYS.notificationsStore);
            if (!Array.isArray(notificationsStore[uid])) {
                notificationsStore[uid] = [];
                saveStore(KEYS.notificationsStore, notificationsStore);
            }

            const activitiesStore = getStore(KEYS.activitiesStore);
            if (!Array.isArray(activitiesStore[uid])) {
                activitiesStore[uid] = [];
                saveStore(KEYS.activitiesStore, activitiesStore);
            }
        }

        initializeStorage();


        /* =================================================
           THEME (kept global on purpose - shared across
           pages/accounts on this browser, same as before)
        ================================================= */

        const darkModeBtn = $("dark-mode-btn");
        const themeIcon = $("theme-icon");

        function applyTheme() {

            const dark = localStorage.getItem(KEYS.theme) === "dark";
            document.body.classList.toggle("dark", dark);

            if (themeIcon) {
                themeIcon.className = dark
                    ? "fa-regular fa-moon"
                    : "fa-regular fa-sun";
            }
        }

        applyTheme();

        if (darkModeBtn) {

            darkModeBtn.addEventListener("click", function () {

                const dark = !document.body.classList.contains("dark");
                document.body.classList.toggle("dark", dark);

                localStorage.setItem(KEYS.theme, dark ? "dark" : "light");

                if (themeIcon) {
                    themeIcon.className = dark
                        ? "fa-regular fa-moon"
                        : "fa-regular fa-sun";
                }
            });
        }


        /* =================================================
           LOGOUT
        ================================================= */

        const logoutBtn = $("logout-btn");

        if (logoutBtn) {

            logoutBtn.addEventListener("click", function () {

                const confirmed = window.confirm(
                    "Are you sure you want to logout?"
                );

                if (!confirmed) return;

                localStorage.removeItem(KEYS.loggedIn);
                localStorage.removeItem(KEYS.currentUser);

                window.location.href = "index.html";
            });
        }


        /* =================================================
           MOBILE SIDEBAR
        ================================================= */

        const sidebar = $("sidebar");
        const mobileMenu = $("mobile-menu");

        if (sidebar && mobileMenu) {

            mobileMenu.addEventListener("click", function (event) {
                event.stopPropagation();
                sidebar.classList.toggle("open");
            });

            document.addEventListener("click", function (event) {

                if (
                    window.innerWidth <= 800 &&
                    sidebar.classList.contains("open") &&
                    !sidebar.contains(event.target) &&
                    !mobileMenu.contains(event.target)
                ) {
                    sidebar.classList.remove("open");
                }
            });
        }


        /* =================================================
           DATE HELPERS
        ================================================= */

        function sameDay(a, b) {
            return (
                a.getFullYear() === b.getFullYear() &&
                a.getMonth() === b.getMonth() &&
                a.getDate() === b.getDate()
            );
        }

        function isToday(date) {
            if (!date) return false;
            return sameDay(date, new Date());
        }

        function isThisWeek(date) {

            if (!date) return false;

            const now = new Date();
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);

            let day = start.getDay();
            if (day === 0) day = 7;

            start.setDate(start.getDate() - (day - 1));

            return date >= start;
        }

        function isThisMonth(date) {

            if (!date) return false;

            const now = new Date();

            return (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth()
            );
        }


        /* =================================================
           SALES HELPERS
           ---------------------------------------------------
           A sale ONLY represents a completed transaction.
           Revenue = sellingPrice * quantity
           Cost    = purchasePrice * quantity
           Profit  = Revenue - Cost
           These are computed strictly from the sale record
           itself (which is filled in from the real product
           at the moment the sale is created - see "NEW SALE"
           below) - never from a random/mock fallback.
        ================================================= */

        function saleDate(sale) {
            return getDate(sale.date || sale.createdAt);
        }

        function saleQuantity(sale) {
            return Number(sale.quantity) || 0;
        }

        function saleRevenue(sale) {
            const quantity = saleQuantity(sale);
            const price = Number(sale.sellingPrice) || 0;
            return quantity * price;
        }

        function saleCost(sale) {
            const quantity = saleQuantity(sale);
            const cost = Number(sale.costPrice) || 0;
            return quantity * cost;
        }

        function saleProfit(sale) {
            return saleRevenue(sale) - saleCost(sale);
        }


        /* =================================================
           STATISTICS (current account only, real sales only)
        ================================================= */

        function loadStatistics() {

            const sales = getUserArray(KEYS.salesStore, uid);
            const products = getUserArray(KEYS.productsStore, uid);

            let todaySales = 0, todayProfit = 0;
            let weeklySales = 0, weeklyProfit = 0;
            let monthlySales = 0, monthlyProfit = 0;
            let totalSales = 0, totalProfit = 0;

            for (const sale of sales) {

                const date = saleDate(sale);
                const revenue = saleRevenue(sale);
                const profit = saleProfit(sale);

                totalSales += revenue;
                totalProfit += profit;

                if (isToday(date)) {
                    todaySales += revenue;
                    todayProfit += profit;
                }

                if (isThisWeek(date)) {
                    weeklySales += revenue;
                    weeklyProfit += profit;
                }

                if (isThisMonth(date)) {
                    monthlySales += revenue;
                    monthlyProfit += profit;
                }
            }

            const activeProducts = products.filter(
                product => (Number(product.stock) || 0) > 0
            ).length;

            setText("today-sales", money(todaySales));
            setText("today-profit", money(todayProfit));
            setText("weekly-sales", money(weeklySales));
            setText("weekly-profit", money(weeklyProfit));
            setText("monthly-sales", money(monthlySales));
            setText("monthly-profit", money(monthlyProfit));
            setText("total-sales", money(totalSales));
            setText("total-orders", num(sales.length));

            setText(
                "average-order",
                money(sales.length ? totalSales / sales.length : 0)
            );

            setText("active-products", num(activeProducts));
        }


        /* =================================================
           LOW STOCK
        ================================================= */

        function loadLowStock() {

            const container = $("low-stock-list");
            if (!container) return;

            const products = getUserArray(KEYS.productsStore, uid);

            const lowStock = products
                .filter(product => {
                    const stock = Number(product.stock) || 0;
                    const minimum = Number(
                        product.minStock ??
                        product.minimumStock ??
                        product.min_stock ??
                        5
                    );
                    return stock <= minimum;
                })
                .slice(0, 5);

            if (lowStock.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        No low-stock products.
                    </div>
                `;
                return;
            }

            container.innerHTML = lowStock.map(product => {

                const stock = Number(product.stock) || 0;
                const minimum = Number(
                    product.minStock ??
                    product.minimumStock ??
                    product.min_stock ??
                    5
                );

                return `
                    <div class="stock-item">
                        <div>
                            <div class="stock-name">
                                ${escapeHTML(product.name || "Unknown product")}
                            </div>
                            <div class="stock-meta">
                                Minimum: ${minimum}
                            </div>
                        </div>
                        <span class="stock-warning">
                            ${stock} left
                        </span>
                    </div>
                `;
            }).join("");
        }


        /* =================================================
           BEST SELLING (this month, current account only)
        ================================================= */

        function loadBestSelling() {

            const container = $("best-selling-list");
            if (!container) return;

            const sales = getUserArray(KEYS.salesStore, uid);
            const map = new Map();

            for (const sale of sales) {

                const date = saleDate(sale);
                if (!isThisMonth(date)) continue;

                const name = String(sale.product || sale.productName || "Unknown product");
                const quantity = saleQuantity(sale);
                const revenue = saleRevenue(sale);
                const profit = saleProfit(sale);

                if (!map.has(name)) {
                    map.set(name, { name, quantity: 0, revenue: 0, profit: 0 });
                }

                const item = map.get(name);
                item.quantity += quantity;
                item.revenue += revenue;
                item.profit += profit;
            }

            const best = Array.from(map.values())
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);

            if (best.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        No sales data yet.
                    </div>
                `;
                return;
            }

            container.innerHTML = best.map(item => `
                <div class="best-item">
                    <div>
                        <div class="best-name">${escapeHTML(item.name)}</div>
                        <div class="best-meta">
                            ${num(item.quantity)} units · ${money(item.revenue)}
                        </div>
                    </div>
                    <strong>${money(item.profit)}</strong>
                </div>
            `).join("");
        }


        /* =================================================
           RECENT SALES
        ================================================= */

        function loadRecentSales() {

            const body = $("recent-sales-body");
            if (!body) return;

            const sales = getUserArray(KEYS.salesStore, uid);

            const recent = [...sales]
                .sort((a, b) => (saleDate(b)?.getTime() || 0) - (saleDate(a)?.getTime() || 0))
                .slice(0, 5);

            if (recent.length === 0) {
                body.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align:center;">
                            No sales yet.
                        </td>
                    </tr>
                `;
                return;
            }

            body.innerHTML = recent.map(sale => {

                const invoice = sale.invoice || "-";
                const customer = sale.customer || "-";
                const product = sale.product || sale.productName || "-";
                const quantity = saleQuantity(sale);
                const total = saleRevenue(sale);
                const profit = saleProfit(sale);
                const date = saleDate(sale);

                const statusText = String(sale.status || "Completed");
                const lower = statusText.toLowerCase();

                let statusClass = "completed";
                if (lower.includes("pending")) statusClass = "pending";
                else if (lower.includes("cancel")) statusClass = "cancelled";

                return `
                    <tr>
                        <td>${escapeHTML(invoice)}</td>
                        <td>${escapeHTML(customer)}</td>
                        <td>${escapeHTML(product)}</td>
                        <td>${quantity}</td>
                        <td>${money(total)}</td>
                        <td>${money(profit)}</td>
                        <td>${date ? date.toLocaleDateString() : "-"}</td>
                        <td><span class="status ${statusClass}">${escapeHTML(statusText)}</span></td>
                    </tr>
                `;
            }).join("");
        }


        /* =================================================
           ACTIVITIES
        ================================================= */

        function loadActivities() {

            const container = $("activity-list");
            if (!container) return;

            const activities = getUserArray(KEYS.activitiesStore, uid);

            const recent = [...activities]
                .sort((a, b) => (getDate(b.date)?.getTime() || 0) - (getDate(a.date)?.getTime() || 0))
                .slice(0, 6);

            if (recent.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        No recent activity.
                    </div>
                `;
                return;
            }

            container.innerHTML = recent.map(activity => {

                const date = getDate(activity.date);

                return `
                    <div class="activity-item">
                        <div class="activity-dot">
                            <i class="fa-solid fa-circle"></i>
                        </div>
                        <div class="activity-content">
                            <strong>${escapeHTML(activity.title || "Activity")}</strong>
                            <span>${escapeHTML(activity.message || "")}</span>
                            <div class="activity-time">
                                ${date ? date.toLocaleString() : ""}
                            </div>
                        </div>
                    </div>
                `;
            }).join("");
        }


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

            list.innerHTML = notifications.slice(0, 8).map((notification, index) => {

                const date = getDate(notification.date);

                return `
                    <div class="notification-item ${notification.read ? "" : "unread"}" data-index="${index}">
                        <div class="notification-title">
                            ${escapeHTML(notification.title || "Notification")}
                        </div>
                        <div class="notification-message">
                            ${escapeHTML(notification.message || "")}
                        </div>
                        <div class="notification-date">
                            ${date ? date.toLocaleString() : ""}
                        </div>
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

        function pushNotification(title, message) {
            const notifications = getUserArray(KEYS.notificationsStore, uid);

            notifications.unshift({
                id: "notification-" + Date.now(),
                title,
                message,
                read: false,
                date: new Date().toISOString()
            });

            setUserArray(KEYS.notificationsStore, uid, notifications.slice(0, 50));
        }

        function logActivity(title, message) {
            const activities = getUserArray(KEYS.activitiesStore, uid);

            activities.unshift({
                id: "activity-" + Date.now(),
                title,
                message,
                date: new Date().toISOString()
            });

            setUserArray(KEYS.activitiesStore, uid, activities.slice(0, 50));
        }


        /* =================================================
           NOTIFICATION BUTTON
        ================================================= */

        const notificationBtn = $("notification-btn");
        const notificationPanel = $("notification-panel");

        if (notificationBtn && notificationPanel) {

            notificationBtn.addEventListener("click", function (event) {
                event.stopPropagation();
                notificationPanel.classList.toggle("show");
            });

            document.addEventListener("click", function (event) {
                if (
                    !notificationPanel.contains(event.target) &&
                    !notificationBtn.contains(event.target)
                ) {
                    notificationPanel.classList.remove("show");
                }
            });
        }


        /* =================================================
           MARK ALL READ
        ================================================= */

        const markAllRead = $("mark-all-read");

        if (markAllRead) {

            markAllRead.addEventListener("click", function () {

                const notifications = getUserArray(KEYS.notificationsStore, uid);
                notifications.forEach(n => { n.read = true; });
                setUserArray(KEYS.notificationsStore, uid, notifications);
                loadNotifications();
            });
        }


        /* =================================================
           SEARCH (current account's products & sales only)
        ================================================= */

        const searchInput = $("global-search");
        const searchResults = $("search-results");

        function performSearch(keyword) {

            if (!searchResults) return;

            keyword = String(keyword || "").trim().toLowerCase();

            if (!keyword) {
                searchResults.innerHTML = "";
                searchResults.classList.remove("show");
                return;
            }

            const products = getUserArray(KEYS.productsStore, uid);
            const sales = getUserArray(KEYS.salesStore, uid);
            const results = [];

            for (const product of products) {
                const name = String(product.name || "");
                if (name.toLowerCase().includes(keyword)) {
                    results.push({ type: "Product", title: name, data: product });
                }
            }

            for (const sale of sales) {

                const invoice = String(sale.invoice || "");
                const customer = String(sale.customer || "");
                const product = String(sale.product || sale.productName || "");

                if (
                    invoice.toLowerCase().includes(keyword) ||
                    customer.toLowerCase().includes(keyword) ||
                    product.toLowerCase().includes(keyword)
                ) {
                    results.push({ type: "Sale", title: invoice || customer || product, data: sale });
                }
            }

            if (results.length === 0) {
                searchResults.innerHTML = `<div class="search-empty">No results found</div>`;
            } else {
                searchResults.innerHTML = results.slice(0, 8).map((result, index) => `
                    <div class="search-result" data-index="${index}">
                        <div class="search-result-title">${escapeHTML(result.title)}</div>
                        <div class="search-result-type">${escapeHTML(result.type)}</div>
                    </div>
                `).join("");

                searchResults.querySelectorAll(".search-result").forEach(item => {
                    item.addEventListener("click", function () {
                        const index = Number(item.dataset.index);
                        showSearchInfo(results[index]);
                    });
                });
            }

            searchResults.classList.add("show");
        }

        function showSearchInfo(result) {

            if (!result) return;
            const data = result.data;

            if (result.type === "Product") {
                window.alert(
                    "Product: " + (data.name || "-") +
                    "\nStock: " + (data.stock || 0)
                );
            } else {
                window.alert(
                    "Invoice: " + (data.invoice || "-") +
                    "\nCustomer: " + (data.customer || "-") +
                    "\nTotal: " + money(saleRevenue(data))
                );
            }

            searchResults?.classList.remove("show");
            if (searchInput) searchInput.value = "";
        }

        if (searchInput) {
            searchInput.addEventListener("input", function () {
                performSearch(searchInput.value);
            });
        }

        document.addEventListener("click", function (event) {
            if (
                searchResults && searchInput &&
                !searchResults.contains(event.target) &&
                !searchInput.contains(event.target)
            ) {
                searchResults.classList.remove("show");
            }
        });


        /* =================================================
           EXPORT (current account's sales only)
        ================================================= */

        const exportBtn = $("export-btn");

        if (exportBtn) {

            exportBtn.addEventListener("click", function () {

                const sales = getUserArray(KEYS.salesStore, uid);

                if (sales.length === 0) {
                    window.alert("There are no sales to export.");
                    return;
                }

                const rows = [
                    ["Invoice", "Customer", "Product", "Quantity", "Total", "Profit", "Date", "Status"]
                ];

                sales.forEach(sale => {
                    rows.push([
                        sale.invoice || "",
                        sale.customer || "",
                        sale.product || sale.productName || "",
                        saleQuantity(sale),
                        saleRevenue(sale),
                        saleProfit(sale),
                        saleDate(sale)?.toLocaleString() || "",
                        sale.status || "Completed"
                    ]);
                });

                const csv = rows.map(row =>
                    row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
                ).join("\n");

                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = "AccountPro-Sales.csv";
                document.body.appendChild(link);
                link.click();
                link.remove();

                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
        }


        /* =================================================
           NEW SALE
           ---------------------------------------------------
           A sale must always be linked to a REAL product from
           the current account's own inventory. Selling price
           and purchase price are pulled from that product -
           never typed in manually - so revenue/cost/profit are
           always internally consistent with the inventory.
        ================================================= */

        const newSaleBtn = $("new-sale-btn");

        if (newSaleBtn) {

            newSaleBtn.addEventListener("click", function () {

                const products = getUserArray(KEYS.productsStore, uid);

                if (products.length === 0) {
                    window.alert(
                        "You don't have any products yet.\n" +
                        "Add a product first from Product Management, then record a sale."
                    );
                    return;
                }

                const availableList = products
                    .map(p => `- ${p.name} (${Number(p.stock) || 0} in stock)`)
                    .join("\n");

                const productName = window.prompt(
                    "Which product was sold? Type the exact name.\n\n" + availableList
                );

                if (!productName || !productName.trim()) return;

                const product = products.find(
                    item => String(item.name || "").toLowerCase() === productName.trim().toLowerCase()
                );

                if (!product) {
                    window.alert("That product was not found in your inventory.");
                    return;
                }

                const stock = Number(product.stock) || 0;

                if (stock <= 0) {
                    window.alert(`"${product.name}" is out of stock.`);
                    return;
                }

                const customer = window.prompt("Customer name:", "Walk-in Customer") || "Walk-in Customer";

                const quantity = Number(window.prompt(`Quantity (max ${stock}):`, "1"));

                if (!Number.isFinite(quantity) || quantity <= 0) {
                    window.alert("Invalid quantity.");
                    return;
                }

                if (quantity > stock) {
                    window.alert(`Only ${stock} unit(s) of "${product.name}" are in stock.`);
                    return;
                }

                const sellingPrice = Number(product.price) || 0;
                const costPrice = Number(product.costPrice) || 0;

                const now = new Date();
                const invoice = "INV-" + now.getTime();

                const sale = {
                    id: "sale-" + now.getTime(),
                    invoice,
                    customer,
                    productId: product.id,
                    product: product.name,
                    quantity,
                    sellingPrice,
                    costPrice,
                    status: "Completed",
                    date: now.toISOString(),
                    createdAt: now.toISOString()
                };

                const sales = getUserArray(KEYS.salesStore, uid);
                sales.push(sale);
                setUserArray(KEYS.salesStore, uid, sales);

                // Decrease stock on the real product record
                const productIndex = products.findIndex(p => p.id === product.id);
                if (productIndex !== -1) {
                    products[productIndex].stock = Math.max(0, stock - quantity);
                    setUserArray(KEYS.productsStore, uid, products);
                }

                const revenue = saleRevenue(sale);

                logActivity("New sale created", `${product.name} · ${money(revenue)}`);
                pushNotification("New sale", `${product.name} sold for ${money(revenue)}`);

                refreshDashboard();

                window.alert("Sale recorded successfully.\nInvoice: " + invoice);
            });
        }


        /* =================================================
           VIEW ALL SALES
        ================================================= */

        const viewAllSales = $("view-all-sales");

        if (viewAllSales) {

            viewAllSales.addEventListener("click", function () {

                const sales = getUserArray(KEYS.salesStore, uid);

                if (sales.length === 0) {
                    window.alert("No sales found.");
                    return;
                }

                let text = "Recent Sales\n\n";

                sales.slice().reverse().slice(0, 10).forEach(sale => {
                    text += (sale.invoice || "-") + " | " + (sale.product || "-") +
                        " | " + money(saleRevenue(sale)) + "\n";
                });

                window.alert(text);
            });
        }


        /* =================================================
           SIDEBAR FUTURE LINKS
        ================================================= */

        document.querySelectorAll(".future-link").forEach(link => {

            link.addEventListener("click", function (event) {

                event.preventDefault();

                const module = link.dataset.module || "Module";

                window.alert(
                    `${module} is not connected yet.\n\n` +
                    "It will be connected to the Local Storage modules first, then to Backend."
                );

                if (window.innerWidth <= 800 && sidebar) {
                    sidebar.classList.remove("open");
                }
            });
        });


        /* =================================================
           CHARTS (real data only - flat zero when no sales)
        ================================================= */

        let salesChart = null;
        let profitChart = null;

        function getLast14Days() {

            const days = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 13; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                days.push(date);
            }

            return days;
        }

        function toggleChartEmptyState(hasAnySales) {

            ["sales-chart", "profit-chart"].forEach(canvasId => {

                const canvas = $(canvasId);
                if (!canvas) return;

                const wrapper = canvas.closest(".chart-container");
                if (!wrapper) return;

                let overlay = wrapper.querySelector(".chart-empty-overlay");

                if (!hasAnySales) {

                    canvas.style.visibility = "hidden";

                    if (!overlay) {
                        overlay = document.createElement("div");
                        overlay.className = "chart-empty-overlay";
                        overlay.textContent = "No sales data available yet.";
                        wrapper.style.position = "relative";
                        wrapper.appendChild(overlay);
                    }

                } else {

                    canvas.style.visibility = "visible";
                    if (overlay) overlay.remove();
                }
            });
        }

        function loadCharts() {

            if (typeof Chart === "undefined") {
                console.warn("Chart.js is not loaded.");
                return;
            }

            const sales = getUserArray(KEYS.salesStore, uid);
            const days = getLast14Days();

            toggleChartEmptyState(sales.length > 0);

            const labels = days.map(date =>
                date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            );

            const salesData = days.map(day =>
                sales.reduce((total, sale) => {
                    const date = saleDate(sale);
                    return (date && sameDay(date, day)) ? total + saleRevenue(sale) : total;
                }, 0)
            );

            const profitData = days.map(day =>
                sales.reduce((total, sale) => {
                    const date = saleDate(sale);
                    return (date && sameDay(date, day)) ? total + saleProfit(sale) : total;
                }, 0)
            );

            const salesCanvas = $("sales-chart");
            const profitCanvas = $("profit-chart");

            const baseOptions = {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: "rgba(0,0,0,.05)" },
                        ticks: { font: { size: 8 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 7 }, maxTicksLimit: 7 }
                    }
                }
            };

            if (salesCanvas) {

                if (salesChart) salesChart.destroy();

                salesChart = new Chart(salesCanvas, {
                    type: "line",
                    data: {
                        labels,
                        datasets: [{
                            label: "Sales",
                            data: salesData,
                            borderColor: "#3158f5",
                            backgroundColor: "rgba(49,88,245,0.08)",
                            borderWidth: 2,
                            fill: true,
                            tension: 0.35,
                            pointRadius: 2,
                            pointBackgroundColor: "#3158f5"
                        }]
                    },
                    options: baseOptions
                });
            }

            if (profitCanvas) {

                if (profitChart) profitChart.destroy();

                profitChart = new Chart(profitCanvas, {
                    type: "line",
                    data: {
                        labels,
                        datasets: [{
                            label: "Profit",
                            data: profitData,
                            borderColor: "#6447ef",
                            backgroundColor: "rgba(100,71,239,0.08)",
                            borderWidth: 2,
                            fill: true,
                            tension: 0.35,
                            pointRadius: 2,
                            pointBackgroundColor: "#6447ef"
                        }]
                    },
                    options: baseOptions
                });
            }
        }


        /* =================================================
           REFRESH
        ================================================= */

        function refreshDashboard() {

            try { loadStatistics(); } catch (error) { console.error("Statistics error:", error); }
            try { loadLowStock(); } catch (error) { console.error("Low stock error:", error); }
            try { loadBestSelling(); } catch (error) { console.error("Best selling error:", error); }
            try { loadRecentSales(); } catch (error) { console.error("Recent sales error:", error); }
            try { loadActivities(); } catch (error) { console.error("Activities error:", error); }
            try { loadNotifications(); } catch (error) { console.error("Notifications error:", error); }
            try { loadCharts(); } catch (error) { console.error("Charts error:", error); }
        }


        /* =================================================
           STORAGE SYNC
        ================================================= */

        window.addEventListener("storage", function (event) {
            if (
                !event.key ||
                event.key === KEYS.productsStore ||
                event.key === KEYS.salesStore ||
                event.key === KEYS.notificationsStore ||
                event.key === KEYS.activitiesStore ||
                event.key === KEYS.theme
            ) {
                applyTheme();
                refreshDashboard();
            }
        });


        /* =================================================
           INITIALIZE
        ================================================= */

        refreshDashboard();

        setInterval(function () {
            loadStatistics();
            loadLowStock();
            loadBestSelling();
            loadRecentSales();
            loadActivities();
            loadNotifications();
        }, 30000);


        /* =================================================
           DEBUG
        ================================================= */

        window.AccountPro = {
            refresh: refreshDashboard,
            getProducts: () => getUserArray(KEYS.productsStore, uid),
            getSales: () => getUserArray(KEYS.salesStore, uid),
            getNotifications: () => getUserArray(KEYS.notificationsStore, uid),
            getActivities: () => getUserArray(KEYS.activitiesStore, uid),
            currentAccountId: uid,
            clearSales: function () {
                setUserArray(KEYS.salesStore, uid, []);
                refreshDashboard();
            }
        };

        console.log("AccountPro Dashboard ready. Account:", uid);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startDashboard);
    } else {
        startDashboard();
    }

})();