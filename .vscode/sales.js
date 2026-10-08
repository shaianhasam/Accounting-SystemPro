/* =========================================================
   ACCOUNT PRO
   SALES.JS  (Point of Sale)
   LOCAL STORAGE VERSION - PER ACCOUNT DATA
   ========================================================= */

(function () {
    "use strict";

    function startSales() {

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


        /* =================================================
           KEYS - must match dashboard.js / product.js
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
           AUTH GUARD
        ================================================= */

        const loggedIn = localStorage.getItem(KEYS.loggedIn);
        const currentUser = safeParse(localStorage.getItem(KEYS.currentUser), null);

        if (loggedIn !== "true" || !currentUser) {
            window.location.href = "index.html";
            return;
        }


        /* =================================================
           ACCOUNT ID
        ================================================= */

        function getUserId(user) {
            if (!user) return "guest";

            const raw =
                user.id ?? user.uid ?? user.userId ?? user.email ??
                user.username ?? user.fullName ?? user.name ?? "guest";

            return String(raw).trim().toLowerCase();
        }

        const uid = getUserId(currentUser);


        /* =================================================
           PER-ACCOUNT STORE HELPERS
        ================================================= */

        function getStore(storeKey) {
            const store = safeParse(localStorage.getItem(storeKey), {});
            return (store && typeof store === "object" && !Array.isArray(store)) ? store : {};
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
           NAVBAR USER
        ================================================= */

        function loadUser() {
            const nameEl = $("navbar-user-name");
            const avatarEl = $("user-avatar");

            const fullName = String(currentUser.fullName || currentUser.name || "Admin User").trim();
            if (nameEl) nameEl.textContent = fullName;

            const tipEl = $("user-tooltip");
            if (tipEl) tipEl.textContent = fullName + " \u00b7 Finance Admin";

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
           GLOBAL THEME
        ================================================= */

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
           LOGOUT
        ================================================= */

        const logoutBtn = $("logout-btn");

        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                if (!window.confirm("Are you sure you want to logout?")) return;
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

        document.querySelectorAll(".future-link").forEach(link => {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                const module = link.dataset.module || "Module";
                window.alert(
                    `${module} is not connected yet.\n\n` +
                    "It will be connected to the Local Storage modules first, then to Backend."
                );
                if (window.innerWidth <= 800 && sidebar) sidebar.classList.remove("open");
            });
        });


        /* =================================================
           NOTIFICATIONS / ACTIVITIES
        ================================================= */

        function pushNotification(title, message) {
            const notifications = getUserArray(KEYS.notificationsStore, uid);
            notifications.unshift({
                id: "notification-" + Date.now(), title, message, read: false, date: new Date().toISOString()
            });
            setUserArray(KEYS.notificationsStore, uid, notifications.slice(0, 50));
            loadNotifications();
        }

        function logActivity(title, message) {
            const activities = getUserArray(KEYS.activitiesStore, uid);
            activities.unshift({
                id: "activity-" + Date.now(), title, message, date: new Date().toISOString()
            });
            setUserArray(KEYS.activitiesStore, uid, activities.slice(0, 50));
        }

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
                const date = getDate(n.date);
                return `
                    <div class="notification-item ${n.read ? "" : "unread"}" data-index="${index}">
                        <div class="notification-title">${escapeHTML(n.title || "Notification")}</div>
                        <div class="notification-message">${escapeHTML(n.message || "")}</div>
                        <div class="notification-date">${date ? date.toLocaleString() : ""}</div>
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


        /* =================================================
           GLOBAL SEARCH (topbar)
        ================================================= */

        const globalSearch = $("global-search");
        const searchResults = $("search-results");

        function performGlobalSearch(keyword) {
            if (!searchResults) return;
            keyword = String(keyword || "").trim().toLowerCase();

            if (!keyword) {
                searchResults.innerHTML = "";
                searchResults.classList.remove("show");
                return;
            }

            const products = getUserArray(KEYS.productsStore, uid);
            const results = products
                .filter(p => String(p.name || "").toLowerCase().includes(keyword))
                .slice(0, 8);

            searchResults.innerHTML = results.length === 0
                ? `<div class="search-empty">No results found</div>`
                : results.map((p, index) => `
                    <div class="search-result" data-index="${index}">
                        <div class="search-result-title">${escapeHTML(p.name)}</div>
                        <div class="search-result-type">Product</div>
                    </div>
                `).join("");

            searchResults.querySelectorAll(".search-result").forEach(item => {
                item.addEventListener("click", function () {
                    const index = Number(item.dataset.index);
                    const product = results[index];
                    if (product) {
                        $("pos-search").value = product.name;
                        posFilters.search = product.name.toLowerCase();
                        renderGrid();
                    }
                    searchResults.classList.remove("show");
                    globalSearch.value = "";
                });
            });

            searchResults.classList.add("show");
        }

        if (globalSearch) {
            globalSearch.addEventListener("input", () => performGlobalSearch(globalSearch.value));
        }

        document.addEventListener("click", function (event) {
            if (searchResults && globalSearch && !searchResults.contains(event.target) && !globalSearch.contains(event.target)) {
                searchResults.classList.remove("show");
            }
        });


        /* =================================================
           PRODUCT STATUS / STOCK HELPERS
        ================================================= */

        function getStockLabel(product) {
            const stock = Number(product.stock) || 0;
            const min = Number(product.minStock) || 0;

            if (stock === 0) return { text: "Out of stock", cls: "out" };
            if (stock <= min) return { text: `${stock} left`, cls: "low" };
            return { text: `Stock: ${stock}`, cls: "" };
        }


        /* =================================================
           PRODUCT GRID
        ================================================= */

        let posFilters = { search: "", category: "", sort: "" };
        let viewMode = "grid";

        function getFilteredCatalog() {
            const products = getUserArray(KEYS.productsStore, uid);

            let list = products.filter(product => {
                const name = String(product.name || "").toLowerCase();
                const category = String(product.category || "");

                const matchesSearch = !posFilters.search || name.includes(posFilters.search);
                const matchesCategory = !posFilters.category || category === posFilters.category;

                return matchesSearch && matchesCategory;
            });

            if (posFilters.sort === "price-asc") {
                list = [...list].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
            } else if (posFilters.sort === "price-desc") {
                list = [...list].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
            } else if (posFilters.sort === "name-asc") {
                list = [...list].sort((a, b) => String(a.name).localeCompare(String(b.name)));
            }

            return list;
        }

        function renderGrid() {
            const grid = $("pos-grid");
            if (!grid) return;

            const products = getFilteredCatalog();

            if (products.length === 0) {
                grid.innerHTML = `<div class="empty-state">No products found. Add products from Product Management first.</div>`;
                return;
            }

            grid.innerHTML = products.map(product => {

                const stockInfo = getStockLabel(product);
                const isOut = (Number(product.stock) || 0) <= 0;

                const thumb = product.image
                    ? `<img class="pos-thumb" src="${product.image}" alt="${escapeHTML(product.name)}">`
                    : `<div class="pos-thumb-fallback">${escapeHTML((product.name || "?")[0] || "?").toUpperCase()}</div>`;

                return `
                    <div class="pos-card ${isOut ? "out" : ""}" data-id="${product.id}">
                        ${thumb}
                        <div class="pos-name">${escapeHTML(product.name)}</div>
                        <div class="pos-cat">${escapeHTML(product.category || "")}</div>
                        <div class="pos-price">${money(product.price)}</div>
                        <div class="pos-stock ${stockInfo.cls}">${stockInfo.text}</div>
                    </div>
                `;
            }).join("");

            grid.querySelectorAll(".pos-card").forEach(card => {
                card.addEventListener("click", () => addToCart(card.dataset.id));
            });
        }

        const posSearch = $("pos-search");
        const posCategory = $("pos-category");
        const posSort = $("pos-sort");

        if (posSearch) posSearch.addEventListener("input", () => {
            posFilters.search = posSearch.value.trim().toLowerCase();
            renderGrid();
        });

        if (posCategory) posCategory.addEventListener("change", () => {
            posFilters.category = posCategory.value;
            renderGrid();
        });

        if (posSort) posSort.addEventListener("change", () => {
            posFilters.sort = posSort.value;
            renderGrid();
        });

        const vtGrid = $("vt-grid");
        const vtList = $("vt-list");
        const gridEl = $("pos-grid");

        if (vtGrid && vtList && gridEl) {
            vtGrid.addEventListener("click", () => {
                viewMode = "grid";
                gridEl.classList.remove("list-view");
                vtGrid.classList.add("active");
                vtList.classList.remove("active");
            });
            vtList.addEventListener("click", () => {
                viewMode = "list";
                gridEl.classList.add("list-view");
                vtList.classList.add("active");
                vtGrid.classList.remove("active");
            });
        }


        /* =================================================
           CART / CURRENT SALE
        ================================================= */

        let cart = [];

        function addToCart(productId) {
            const products = getUserArray(KEYS.productsStore, uid);
            const product = products.find(p => String(p.id) === String(productId));
            if (!product) return;

            const stock = Number(product.stock) || 0;
            if (stock <= 0) {
                window.alert(`"${product.name}" is out of stock.`);
                return;
            }

            const existing = cart.find(item => item.productId === productId);

            if (existing) {
                if (existing.qty + 1 > stock) {
                    window.alert(`Only ${stock} unit(s) of "${product.name}" available.`);
                    return;
                }
                existing.qty += 1;
            } else {
                cart.push({
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price) || 0,
                    costPrice: Number(product.costPrice) || 0,
                    stock,
                    qty: 1,
                    image: product.image || null
                });
            }

            renderCart();
        }

        function changeQty(productId, delta) {
            const item = cart.find(i => i.productId === productId);
            if (!item) return;

            const newQty = item.qty + delta;

            if (newQty <= 0) {
                cart = cart.filter(i => i.productId !== productId);
            } else if (newQty > item.stock) {
                window.alert(`Only ${item.stock} unit(s) of "${item.name}" available.`);
                return;
            } else {
                item.qty = newQty;
            }

            renderCart();
        }

        function removeFromCart(productId) {
            cart = cart.filter(i => i.productId !== productId);
            renderCart();
        }

        const cartClearBtn = $("cart-clear");
        if (cartClearBtn) {
            cartClearBtn.addEventListener("click", function () {
                if (cart.length === 0) return;
                if (!window.confirm("Clear all items from the current sale?")) return;
                cart = [];
                renderCart();
            });
        }

        function getSubtotal() {
            return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        }

        function getTotals() {
            const subtotal = getSubtotal();
            const discount = Math.max(0, Number($("cart-discount").value) || 0);
            const taxRate = Math.max(0, Number($("cart-tax-rate").value) || 0);

            const afterDiscount = Math.max(0, subtotal - discount);
            const taxAmount = afterDiscount * taxRate / 100;
            const total = afterDiscount + taxAmount;

            return { subtotal, discount, taxRate, taxAmount, total };
        }

        function renderCart() {

            const container = $("cart-items");
            const title = $("cart-title");

            if (title) title.textContent = `Current Sale (${cart.length})`;

            if (cart.length === 0) {
                container.innerHTML = `<div class="empty-state cart-empty">Cart is empty. Select a product to get started.</div>`;
            } else {
                container.innerHTML = cart.map(item => `
                    <div class="cart-row" data-id="${item.productId}">
                        <div style="flex:1; min-width:0;">
                            <div class="cart-row-name">${escapeHTML(item.name)}</div>
                            <div class="cart-row-price">${money(item.price)} each</div>
                        </div>
                        <div class="cart-qty">
                            <button class="qty-btn qty-minus" data-id="${item.productId}">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn qty-plus" data-id="${item.productId}">+</button>
                        </div>
                        <div class="cart-row-total">${money(item.price * item.qty)}</div>
                        <button class="cart-remove" data-id="${item.productId}" title="Remove">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `).join("");

                container.querySelectorAll(".qty-minus").forEach(btn =>
                    btn.addEventListener("click", () => changeQty(btn.dataset.id, -1)));

                container.querySelectorAll(".qty-plus").forEach(btn =>
                    btn.addEventListener("click", () => changeQty(btn.dataset.id, 1)));

                container.querySelectorAll(".cart-remove").forEach(btn =>
                    btn.addEventListener("click", () => removeFromCart(btn.dataset.id)));
            }

            renderSummary();
        }

        function renderSummary() {
            const { subtotal, taxRate, taxAmount, total } = getTotals();

            $("sum-subtotal").textContent = money(subtotal);
            $("tax-label").textContent = `Tax (${taxRate}%)`;
            $("sum-total").textContent = money(total);

            renderChange();
        }

        function renderChange() {
            const { total } = getTotals();
            const received = Number($("cart-received").value) || 0;
            const change = received - total;

            const box = $("change-box");
            $("sum-change").textContent = money(Math.abs(change));
            box.classList.toggle("negative", change < 0);
        }

        $("cart-discount").addEventListener("input", renderSummary);
        $("cart-tax-rate").addEventListener("input", renderSummary);
        $("cart-received").addEventListener("input", renderChange);


        /* =================================================
           PAYMENT METHOD
        ================================================= */

        let paymentMethod = "Cash";

        document.querySelectorAll(".pay-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                paymentMethod = btn.dataset.method;
            });
        });


        /* =================================================
           TODAY'S SALES / PROFIT (POS header stats)
        ================================================= */

        function saleRevenue(sale) {
            return typeof sale.revenue === "number" ? sale.revenue : 0;
        }

        function saleProfit(sale) {
            return typeof sale.profit === "number" ? sale.profit : 0;
        }

        function refreshHeaderStats() {
            const sales = getUserArray(KEYS.salesStore, uid);
            let todaySales = 0, todayProfit = 0;

            sales.forEach(sale => {
                if (isToday(getDate(sale.date))) {
                    todaySales += saleRevenue(sale);
                    todayProfit += saleProfit(sale);
                }
            });

            $("today-sale-total").textContent = money(todaySales);
            $("today-sale-profit").textContent = money(todayProfit);
        }


        /* =================================================
           RECENT SALES (on the POS page)
        ================================================= */

        function itemsSummary(sale) {
            const items = sale.items || [];
            if (items.length === 0) return "-";
            return items.length === 1 ? "1 item" : `${items.length} items`;
        }

        function refreshRecentSales() {
            const body = $("pos-recent-body");
            if (!body) return;

            const sales = getUserArray(KEYS.salesStore, uid);
            const recent = [...sales]
                .sort((a, b) => (getDate(b.date)?.getTime() || 0) - (getDate(a.date)?.getTime() || 0))
                .slice(0, 5);

            if (recent.length === 0) {
                body.innerHTML = `<tr><td colspan="7"><div class="empty-state">No sales yet.</div></td></tr>`;
                return;
            }

            body.innerHTML = recent.map(sale => {
                const date = getDate(sale.date);
                const time = date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

                return `
                    <tr>
                        <td>${escapeHTML(sale.id)}</td>
                        <td>${escapeHTML(sale.customer || "Walk-in Customer")}</td>
                        <td>${itemsSummary(sale)}</td>
                        <td>${money(sale.total)}</td>
                        <td>${escapeHTML(sale.paymentMethod || "Cash")}</td>
                        <td>${time}</td>
                        <td><button class="row-view-btn" data-id="${sale.id}" title="View / Print"><i class="fa-solid fa-eye"></i></button></td>
                    </tr>
                `;
            }).join("");

            body.querySelectorAll(".row-view-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const sale = sales.find(s => s.id === btn.dataset.id);
                    if (sale) printInvoice(sale);
                });
            });
        }

        const viewAllHistoryBtn = $("view-all-history");
        if (viewAllHistoryBtn) {
            viewAllHistoryBtn.addEventListener("click", () => {
                window.location.href = "sales-history.html";
            });
        }


        /* =================================================
           COMPLETE SALE
        ================================================= */

        const completeBtn = $("complete-sale");

        if (completeBtn) {
            completeBtn.addEventListener("click", function () {

                if (cart.length === 0) {
                    window.alert("The cart is empty. Add at least one product.");
                    return;
                }

                const { subtotal, discount, taxRate, taxAmount, total } = getTotals();
                const received = Number($("cart-received").value) || 0;

                if (received < total) {
                    window.alert(
                        `Received amount ($${received.toFixed(2)}) is less than the total due ($${total.toFixed(2)}).`
                    );
                    return;
                }

                const products = getUserArray(KEYS.productsStore, uid);

                // Re-validate stock right before completing (in case it changed)
                for (const item of cart) {
                    const product = products.find(p => String(p.id) === String(item.productId));
                    const stock = product ? Number(product.stock) || 0 : 0;

                    if (!product || item.qty > stock) {
                        window.alert(`"${item.name}" no longer has enough stock. Please review the cart.`);
                        renderCart();
                        renderGrid();
                        return;
                    }
                }

                const now = new Date();
                const saleId = "INV-" + now.getTime();

                const items = cart.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.qty,
                    sellingPrice: item.price,
                    purchasePrice: item.costPrice,
                    total: item.price * item.qty
                }));

                const revenue = items.reduce((sum, i) => sum + i.total, 0);
                const cost = items.reduce((sum, i) => sum + i.purchasePrice * i.quantity, 0);
                const profit = revenue - cost;

                const sale = {
                    id: saleId,
                    userId: uid,
                    date: now.toISOString(),
                    customer: "Walk-in Customer",
                    items,
                    subtotal,
                    discount,
                    tax: taxAmount,
                    total,
                    paymentMethod,
                    receivedAmount: received,
                    change: received - total,
                    revenue,
                    cost,
                    profit,
                    status: "Completed"
                };

                // Save sale
                const sales = getUserArray(KEYS.salesStore, uid);
                sales.push(sale);
                setUserArray(KEYS.salesStore, uid, sales);

                // Decrease stock on real product records
                const lowStockAlerts = [];

                cart.forEach(item => {
                    const index = products.findIndex(p => String(p.id) === String(item.productId));
                    if (index === -1) return;

                    const newStock = Math.max(0, (Number(products[index].stock) || 0) - item.qty);
                    products[index].stock = newStock;

                    const minStock = Number(products[index].minStock) || 0;

                    if (newStock <= minStock) {
                        lowStockAlerts.push({ name: products[index].name, stock: newStock });
                    }
                });

                setUserArray(KEYS.productsStore, uid, products);

                logActivity("Sale completed", `${saleId} · ${money(total)}`);
                pushNotification("New sale", `${saleId} completed for ${money(total)}`);

                // Low stock / out of stock alerts triggered by this sale
                lowStockAlerts.forEach(({ name, stock }) => {
                    if (stock === 0) {
                        pushNotification(
                            "Out of stock",
                            `"${name}" is now out of stock. Please restock it.`
                        );
                    } else {
                        pushNotification(
                            "Low stock warning",
                            `"${name}" has only ${stock} left. You should purchase more soon.`
                        );
                    }
                });

                // Reset cart + refresh UI
                cart = [];
                $("cart-discount").value = 0;
                $("cart-tax-rate").value = 0;
                $("cart-received").value = "";
                renderCart();
                renderGrid();
                refreshHeaderStats();
                refreshRecentSales();

                printInvoice(sale);
            });
        }


        /* =================================================
           INVOICE PRINTING
        ================================================= */

        function printInvoice(sale) {
            const date = getDate(sale.date) || new Date();

            $("inv-id").textContent = sale.id;
            $("inv-date").textContent = date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
            $("inv-time").textContent = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            $("inv-customer").textContent = sale.customer || "Walk-in Customer";

            $("inv-items").innerHTML = (sale.items || []).map(item => `
                <tr>
                    <td>${escapeHTML(item.name)}</td>
                    <td>${item.quantity}</td>
                    <td>${money(item.sellingPrice)}</td>
                    <td>${money(item.total)}</td>
                </tr>
            `).join("");

            $("inv-subtotal").textContent = money(sale.subtotal);
            $("inv-discount").textContent = money(sale.discount);
            $("inv-tax").textContent = money(sale.tax);
            $("inv-total").textContent = money(sale.total);

            $("inv-payment").textContent = sale.paymentMethod || "Cash";
            $("inv-received").textContent = money(sale.receivedAmount);
            $("inv-change").textContent = money(sale.change);

            window.print();
        }


        /* =================================================
           INIT
        ================================================= */

        renderGrid();
        renderCart();
        refreshHeaderStats();
        refreshRecentSales();
        loadNotifications();

        window.addEventListener("storage", function (event) {
            if (!event.key || event.key === KEYS.productsStore) renderGrid();
            if (!event.key || event.key === KEYS.salesStore) {
                refreshHeaderStats();
                refreshRecentSales();
            }
            if (event.key === KEYS.theme) applyTheme();
        });

        console.log("AccountPro Sales (POS) ready. Account:", uid);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startSales);
    } else {
        startSales();
    }

})();

/* =================================================
   BFCACHE GUARD
   If the browser restores this page from back/forward
   cache (e.g. user clicks Back instead of a sidebar
   link), the page can show a frozen snapshot from
   before data changed elsewhere. Force a fresh reload
   in that case so stock/status/notifications are current.
================================================= */
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});