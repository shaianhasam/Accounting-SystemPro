/* =========================================================
   ACCOUNT PRO
   REPORTS.JS
   LOCAL STORAGE VERSION - PER ACCOUNT DATA
   Every number on this page is calculated from the current
   account's real sales/products - nothing is hardcoded.
   ========================================================= */

(function () {
    "use strict";

    function startReports() {

        const $ = (id) => document.getElementById(id);

        function safeParse(value, fallback) {
            try {
                const parsed = JSON.parse(value);
                return parsed ?? fallback;
            } catch {
                return fallback;
            }
        }

        /* Currency is a per-account setting ("USD" or "AFN"), chosen on the
           Product page. Amounts are never converted - only the symbol and
           number format change. */
        function getCurrency() {
            const store = safeParse(localStorage.getItem("accountProCurrencyByUser"), {});
            return store && store[uid] === "AFN" ? "AFN" : "USD";
        }

        function currencySymbol() {
            return getCurrency() === "AFN" ? "\u060B" : "\$";
        }

        function money(value) {
            const amount = Number(value) || 0;

            if (getCurrency() === "AFN") {
                return amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) + " \u060B";
            }

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


        /* =================================================
           KEYS (same as every other page)
        ================================================= */

        const KEYS = {
            loggedIn: "accountProLoggedIn",
            currentUser: "accountProCurrentUser",
            productsStore: "accountProProductsByUser",
            salesStore: "accountProSalesByUser",
            notificationsStore: "accountProNotificationsByUser",
            expensesStore: "accountProExpensesByUser", // اضافه شده برای مدیریت هزینه‌ها
            theme: "dashboardTheme"
        };


        /* =================================================
           AUTH GUARD + ACCOUNT ID
        ================================================= */

        const loggedIn = localStorage.getItem(KEYS.loggedIn);
        const currentUser = safeParse(localStorage.getItem(KEYS.currentUser), null);

        if (loggedIn !== "true" || !currentUser) {
            window.location.href = "index.html";
            return;
        }

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

        function getUserArray(storeKey, userId) {
            const arr = getStore(storeKey)[userId];
            return Array.isArray(arr) ? arr : [];
        }

        function setUserArray(storeKey, userId, value) {
            const store = getStore(storeKey);
            store[userId] = Array.isArray(value) ? value : [];
            try {
                localStorage.setItem(storeKey, JSON.stringify(store));
            } catch (error) {
                console.error("Cannot save localStorage:", error);
            }
        }


        /* =================================================
           NAVBAR USER (+ hover / tap tooltip with full name)
        ================================================= */

        const fullName = String(currentUser.fullName || currentUser.name || "Admin User").trim();

        function loadUser() {
            const nameEl = $("navbar-user-name");
            const avatarEl = $("user-avatar");
            const tipEl = $("user-tooltip");
            const navUser = document.querySelector(".navbar-user");

            if (nameEl) nameEl.textContent = fullName;
            if (tipEl) tipEl.textContent = fullName + " · Finance Admin";

            if (avatarEl) {
                const parts = fullName.split(/\s+/).filter(Boolean);
                let initials = "U";
                if (parts.length >= 2) initials = parts[0][0] + parts[1][0];
                else if (parts.length === 1) initials = parts[0][0];
                avatarEl.textContent = initials.toUpperCase();
            }

            if (navUser) {
                navUser.addEventListener("click", function (event) {
                    event.stopPropagation();
                    navUser.classList.toggle("show-tooltip");
                });
                document.addEventListener("click", function () {
                    navUser.classList.remove("show-tooltip");
                });
            }
        }

        loadUser();


        /* =================================================
           THEME / LOGOUT / MOBILE SIDEBAR
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
                renderCharts();
            });
        }

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


        /* =================================================
           GLOBAL SEARCH
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

            const results = [];

            getUserArray(KEYS.productsStore, uid).forEach(p => {
                if (String(p.name || "").toLowerCase().includes(keyword)) {
                    results.push({ type: "Product", title: p.name, href: "product.html" });
                }
            });

            getUserArray(KEYS.salesStore, uid).forEach(s => {
                if (
                    String(s.id || "").toLowerCase().includes(keyword) ||
                    String(s.customer || "").toLowerCase().includes(keyword)
                ) {
                    results.push({ type: "Sale", title: s.id, href: "sales-history.html" });
                }
            });

            const shown = results.slice(0, 8);

            searchResults.innerHTML = shown.length === 0
                ? `<div class="search-empty">No results found</div>`
                : shown.map((r, index) => `
                    <div class="search-result" data-index="${index}">
                        <div class="search-result-title">${escapeHTML(r.title)}</div>
                        <div class="search-result-type">${escapeHTML(r.type)}</div>
                    </div>
                `).join("");

            searchResults.querySelectorAll(".search-result").forEach(item => {
                item.addEventListener("click", function () {
                    const r = shown[Number(item.dataset.index)];
                    if (r) window.location.href = r.href;
                });
            });

            searchResults.classList.add("show");
        }

        if (globalSearch) {
            globalSearch.addEventListener("input", () => performGlobalSearch(globalSearch.value));
        }


        /* =================================================
           DATE HELPERS
        ================================================= */

        const DAY = 86400000;

        function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
        function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }
        function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

        function fmtShort(d) {
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }

        function fmtLong(d) {
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        }

        function toInput(d) {
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${d.getFullYear()}-${m}-${day}`;
        }

        function fromInput(value) {
            const [y, m, d] = String(value).split("-").map(Number);
            return new Date(y, m - 1, d);
        }

        function weekStart(d) {
            const x = startOfDay(d);
            let day = x.getDay();
            if (day === 0) day = 7;
            x.setDate(x.getDate() - (day - 1));
            return x;
        }


        /* =================================================
           SALE HELPERS
        ================================================= */

        function saleDate(sale) {
            return getDate(sale.date || sale.createdAt);
        }

        function saleQty(sale) {
            return Number(sale.quantity) || 0;
        }

        function saleRevenue(sale) {
            if (typeof sale.revenue === "number") return sale.revenue;
            return saleQty(sale) * (Number(sale.sellingPrice) || 0);
        }

        function saleProfit(sale) {
            if (typeof sale.profit === "number") return sale.profit;
            return saleRevenue(sale) - saleQty(sale) * (Number(sale.costPrice) || 0);
        }

        function saleItemsList(sale) {
            if (Array.isArray(sale.items) && sale.items.length) return sale.items;
            if (sale.product || sale.productName) {
                return [{
                    name: sale.product || sale.productName,
                    quantity: saleQty(sale),
                    sellingPrice: Number(sale.sellingPrice) || 0,
                    purchasePrice: Number(sale.costPrice) || 0,
                    total: saleRevenue(sale)
                }];
            }
            return [];
        }


        /* =================================================
           STATE
        ================================================= */

        let range = {
            from: startOfDay(addDays(new Date(), -6)),
            to: endOfDay(new Date())
        };

        const gran = { sales: "daily", profit: "daily", table: "daily" };

        let salesChart = null;
        let profitChart = null;


        /* =================================================
           DATA
        ================================================= */

        function salesInRange(from, to) {
            return getUserArray(KEYS.salesStore, uid).filter(sale => {
                const d = saleDate(sale);
                return d && d >= from && d <= to;
            });
        }

        function sumUp(list) {
            const customers = new Set();
            let revenue = 0, profit = 0;

            list.forEach(sale => {
                revenue += saleRevenue(sale);
                profit += saleProfit(sale);
                const name = String(sale.customer || "").trim().toLowerCase();
                if (name) customers.add(name);
            });

            return {
                revenue,
                profit,
                orders: list.length,
                avg: list.length ? revenue / list.length : 0,
                customers: customers.size
            };
        }

        function bucketKey(d, g) {
            if (g === "weekly") return toInput(weekStart(d));
            if (g === "monthly") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            return toInput(d);
        }

        function buildBuckets(g) {
            const map = new Map();
            const end = startOfDay(range.to);
            let cursor = startOfDay(range.from);
            let guard = 0;

            while (cursor <= end && guard < 3700) {
                const key = bucketKey(cursor, g);
                if (!map.has(key)) {
                    map.set(key, { key, start: new Date(cursor), end: new Date(cursor), sales: 0, profit: 0, orders: 0 });
                }
                map.get(key).end = new Date(cursor);
                cursor = addDays(cursor, 1);
                guard++;
            }

            salesInRange(range.from, range.to).forEach(sale => {
                const bucket = map.get(bucketKey(saleDate(sale), g));
                if (bucket) {
                    bucket.sales += saleRevenue(sale);
                    bucket.profit += saleProfit(sale);
                    bucket.orders += 1;
                }
            });

            return Array.from(map.values()).map(b => {
                let label, full;

                if (g === "weekly") {
                    label = fmtShort(b.start);
                    full = `${fmtShort(b.start)} - ${fmtLong(b.end)}`;
                } else if (g === "monthly") {
                    label = b.start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                    full = b.start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                } else {
                    label = fmtShort(b.start);
                    full = fmtLong(b.start);
                }

                return { ...b, label, full };
            });
        }


        /* =================================================
           STAT CARDS + SUMMARY (محاسبه واقعی هزینه‌ها)
        ================================================= */

        function setGrowth(id, current, previous) {
            const el = $(id);
            if (!el) return;

            el.className = "growth";

            if (previous === 0 && current === 0) {
                el.textContent = "—";
                return;
            }

            if (previous === 0) {
                el.textContent = "New";
                el.classList.add("positive");
                return;
            }

            const pct = ((current - previous) / previous) * 100;
            el.textContent = (pct >= 0 ? "↑ " : "↓ ") + Math.abs(pct).toFixed(1) + "%";
            el.classList.add(pct >= 0 ? "positive" : "negative");
        }

        function renderStats() {
            const current = sumUp(salesInRange(range.from, range.to));

            const days = Math.round((startOfDay(range.to) - startOfDay(range.from)) / DAY) + 1;
            const prevTo = endOfDay(addDays(range.from, -1));
            const prevFrom = startOfDay(addDays(range.from, -days));
            const previous = sumUp(salesInRange(prevFrom, prevTo));

            // خواندن هزینه‌های تجاری پرداخت‌شده واقعی از localStorage
            const userExpenses = getUserArray(KEYS.expensesStore, uid);
            let totalBusinessExpenses = 0;
            userExpenses.forEach(ex => {
                if (ex.status === "Paid" && ex.type === "Business") {
                    const exDate = getDate(ex.date);
                    if (exDate && exDate >= range.from && exDate <= range.to) {
                        totalBusinessExpenses += Number(ex.amount || 0);
                    }
                }
            });

            const net = current.profit - totalBusinessExpenses;

            $("st-sales").textContent = money(current.revenue);
            $("st-profit").textContent = money(current.profit);
            $("st-orders").textContent = current.orders;
            $("st-avg").textContent = money(current.avg);
            $("st-expenses").textContent = money(totalBusinessExpenses);

            setGrowth("st-sales-growth", current.revenue, previous.revenue);
            setGrowth("st-profit-growth", current.profit, previous.profit);
            setGrowth("st-orders-growth", current.orders, previous.orders);
            setGrowth("st-avg-growth", current.avg, previous.avg);

            $("sm-sales").textContent = money(current.revenue);
            $("sm-profit").textContent = money(current.profit);
            $("sm-expenses").textContent = money(totalBusinessExpenses);
            $("sm-net").textContent = money(net);
            $("sm-orders").textContent = current.orders;
            $("sm-customers").textContent = current.customers;
        }


        /* =================================================
           CHARTS
        ================================================= */

        function chartTheme() {
            const dark = document.body.classList.contains("dark");
            return {
                grid: dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.05)",
                tick: dark ? "#9ca3af" : "#8a94a8"
            };
        }

        function setChartEmpty(canvasId, empty) {
            const canvas = $(canvasId);
            if (!canvas) return;
            const wrapper = canvas.closest(".chart-container");
            if (!wrapper) return;

            let overlay = wrapper.querySelector(".chart-empty-overlay");

            if (empty) {
                canvas.style.visibility = "hidden";
                if (!overlay) {
                    overlay = document.createElement("div");
                    overlay.className = "chart-empty-overlay";
                    overlay.textContent = "No sales data in this period.";
                    wrapper.style.position = "relative";
                    wrapper.appendChild(overlay);
                }
            } else {
                canvas.style.visibility = "visible";
                if (overlay) overlay.remove();
            }
        }

        function drawChart(existing, canvasId, g, field, color) {
            const canvas = $(canvasId);
            if (!canvas || typeof Chart === "undefined") return existing;

            if (existing) existing.destroy();

            const buckets = buildBuckets(g);
            const theme = chartTheme();

            return new Chart(canvas, {
                type: "line",
                data: {
                    labels: buckets.map(b => b.label),
                    datasets: [{
                        label: field === "sales" ? "Sales" : "Profit",
                        data: buckets.map(b => b[field]),
                        borderColor: color,
                        backgroundColor: color + "22",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.35,
                        pointRadius: 3,
                        pointBackgroundColor: color
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => " " + money(ctx.parsed.y)
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: theme.grid },
                            ticks: {
                                color: theme.tick,
                                font: { size: 9 },
                                callback: v => currencySymbol() + (v >= 1000 ? (v / 1000) + "K" : v)
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: theme.tick, font: { size: 9 }, maxTicksLimit: 8 }
                        }
                    }
                }
            });
        }

        function renderCharts() {
            const hasSales = salesInRange(range.from, range.to).length > 0;

            setChartEmpty("rp-sales-chart", !hasSales);
            setChartEmpty("rp-profit-chart", !hasSales);

            salesChart = drawChart(salesChart, "rp-sales-chart", gran.sales, "sales", "#3158f5");
            profitChart = drawChart(profitChart, "rp-profit-chart", gran.profit, "profit", "#20b486");
        }

        $("gran-sales").addEventListener("change", function () {
            gran.sales = this.value;
            renderCharts();
        });

        $("gran-profit").addEventListener("change", function () {
            gran.profit = this.value;
            renderCharts();
        });


        /* =================================================
           SALES REPORT TABLE
        ================================================= */

        function renderTable() {
            const body = $("rp-report-body");
            const foot = $("rp-report-foot");
            if (!body || !foot) return;

            const buckets = buildBuckets(gran.table);
            const userExpenses = getUserArray(KEYS.expensesStore, uid);

            const total = buckets.reduce((acc, b) => {
                acc.sales += b.sales;
                acc.profit += b.profit;
                acc.orders += b.orders;
                return acc;
            }, { sales: 0, profit: 0, orders: 0 });

            if (total.orders === 0) {
                body.innerHTML = `<tr><td colspan="7"><div class="empty-state">No sales in this period.</div></td></tr>`;
                foot.innerHTML = "";
                return;
            }

            body.innerHTML = buckets.map(b => {
                // محاسبه هزینه‌های هر سطل زمانی (Bucket) در جدول
                let bucketExpenses = 0;
                userExpenses.forEach(ex => {
                    if (ex.status === "Paid" && ex.type === "Business") {
                        const d = getDate(ex.date);
                        if (d && d >= b.start && d <= b.end) {
                            bucketExpenses += Number(ex.amount || 0);
                        }
                    }
                });

                const netBProfit = b.profit - bucketExpenses;

                return `
                    <tr>
                        <td>${escapeHTML(b.full)}</td>
                        <td>${money(b.sales)}</td>
                        <td>${money(b.profit)}</td>
                        <td>${b.orders}</td>
                        <td>${money(b.orders ? b.sales / b.orders : 0)}</td>
                        <td>${money(bucketExpenses)}</td>
                        <td>${money(netBProfit)}</td>
                    </tr>
                `;
            }).join("");

            let overallExpenses = 0;
            userExpenses.forEach(ex => {
                if (ex.status === "Paid" && ex.type === "Business") {
                    const d = getDate(ex.date);
                    if (d && d >= range.from && d <= range.to) {
                        overallExpenses += Number(ex.amount || 0);
                    }
                }
            });

            const overallNetProfit = total.profit - overallExpenses;

            foot.innerHTML = `
                <tr>
                    <td>Total</td>
                    <td>${money(total.sales)}</td>
                    <td>${money(total.profit)}</td>
                    <td>${total.orders}</td>
                    <td>${money(total.orders ? total.sales / total.orders : 0)}</td>
                    <td>${money(overallExpenses)}</td>
                    <td>${money(overallNetProfit)}</td>
                </tr>
            `;
        }

        document.querySelectorAll(".rp-tab").forEach(tab => {
            tab.addEventListener("click", function () {
                document.querySelectorAll(".rp-tab").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                gran.table = tab.dataset.gran;
                renderTable();
            });
        });


        /* =================================================
           TOP SELLING + LOW STOCK
        ================================================= */

        function productThumb(name, image) {
            if (image) return `<img class="rp-thumb" src="${image}" alt="${escapeHTML(name)}">`;
            return `<div class="rp-thumb rp-thumb-fb">${escapeHTML((name || "?")[0] || "?").toUpperCase()}</div>`;
        }

        function renderTopProducts() {
            const container = $("rp-top-products");
            if (!container) return;

            const products = getUserArray(KEYS.productsStore, uid);
            const map = new Map();

            salesInRange(range.from, range.to).forEach(sale => {
                saleItemsList(sale).forEach(item => {
                    const name = String(item.name || "Unknown product");
                    const qty = Number(item.quantity) || 0;
                    const revenue = typeof item.total === "number"
                        ? item.total
                        : qty * (Number(item.sellingPrice) || 0);

                    if (!map.has(name)) {
                        map.set(name, { name, productId: item.productId, qty: 0, revenue: 0 });
                    }

                    const entry = map.get(name);
                    entry.qty += qty;
                    entry.revenue += revenue;
                });
            });

            const top = Array.from(map.values())
                .sort((a, b) => b.qty - a.qty)
                .slice(0, 5);

            if (top.length === 0) {
                container.innerHTML = `<div class="empty-state">No sales in this period.</div>`;
                return;
            }

            container.innerHTML = top.map(item => {
                const product = products.find(p =>
                    (item.productId !== undefined && String(p.id) === String(item.productId)) ||
                    String(p.name || "").toLowerCase() === item.name.toLowerCase()
                );

                return `
                    <div class="rp-prod-row">
                        ${productThumb(item.name, product && product.image)}
                        <div class="rp-prod-info">
                            <div class="rp-prod-name">${escapeHTML(item.name)}</div>
                            <div class="rp-prod-meta">${item.qty} sold</div>
                        </div>
                        <div class="rp-prod-amount">${money(item.revenue)}</div>
                    </div>
                `;
            }).join("");
        }

        function renderLowStock() {
            const container = $("rp-low-stock");
            if (!container) return;

            const low = getUserArray(KEYS.productsStore, uid)
                .filter(p => (Number(p.stock) || 0) <= (Number(p.minStock) || 0))
                .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
                .slice(0, 5);

            if (low.length === 0) {
                container.innerHTML = `<div class="empty-state">No low-stock products.</div>`;
                return;
            }

            container.innerHTML = low.map(p => {
                const stock = Number(p.stock) || 0;
                return `
                    <div class="rp-prod-row">
                        ${productThumb(p.name, p.image)}
                        <div class="rp-prod-info">
                            <div class="rp-prod-name">${escapeHTML(p.name)}</div>
                            <div class="rp-prod-meta">Stock: ${stock}</div>
                        </div>
                        <span class="rp-pill ${stock === 0 ? "out" : "low"}">${stock === 0 ? "Out of Stock" : "Low"}</span>
                    </div>
                `;
            }).join("");
        }


        /* =================================================
           DATE RANGE PICKER
        ================================================= */

        const rangePop = $("range-pop");
        const rangeBtn = $("range-btn");

        function updateRangeLabel() {
            $("range-label").textContent = `${fmtLong(range.from)} - ${fmtLong(range.to)}`;
        }

        function setRange(from, to) {
            range = { from: startOfDay(from), to: endOfDay(to) };
            updateRangeLabel();
            rangePop.classList.remove("show");
            refreshReports();
        }

        rangeBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            $("range-from").value = toInput(range.from);
            $("range-to").value = toInput(range.to);
            rangePop.classList.toggle("show");
        });

        rangePop.addEventListener("click", event => event.stopPropagation());

        document.addEventListener("click", function () {
            rangePop.classList.remove("show");
        });

        document.querySelectorAll(".range-preset").forEach(btn => {
            btn.addEventListener("click", function () {
                const today = new Date();
                const preset = btn.dataset.preset;

                if (preset === "7") setRange(addDays(today, -6), today);
                else if (preset === "30") setRange(addDays(today, -29), today);
                else setRange(new Date(today.getFullYear(), today.getMonth(), 1), today);
            });
        });

        $("range-apply").addEventListener("click", function () {
            const fromValue = $("range-from").value;
            const toValue = $("range-to").value;

            if (!fromValue || !toValue) {
                window.alert("Please choose both a start and an end date.");
                return;
            }

            const from = fromInput(fromValue);
            const to = fromInput(toValue);

            if (from > to) {
                window.alert("The start date must be before the end date.");
                return;
            }

            setRange(from, to);
        });


        /* =================================================
           EXPORT REPORT
        ================================================= */

        $("export-report-btn").addEventListener("click", function () {
            const buckets = buildBuckets(gran.table);
            const userExpenses = getUserArray(KEYS.expensesStore, uid);

            const total = buckets.reduce((acc, b) => {
                acc.sales += b.sales;
                acc.profit += b.profit;
                acc.orders += b.orders;
                return acc;
            }, { sales: 0, profit: 0, orders: 0 });

            if (total.orders === 0) {
                window.alert("There are no sales in this period to export.");
                return;
            }

            const rows = [
                ["AccountPro Sales & Expenses Report", `${fmtLong(range.from)} - ${fmtLong(range.to)}`, "Currency: " + getCurrency()],
                [],
                ["Date", "Total Sales", "Total Profit", "Orders", "Avg Order Value", "Expenses", "Net Profit"]
            ];

            buckets.forEach(b => {
                let bucketExpenses = 0;
                userExpenses.forEach(ex => {
                    if (ex.status === "Paid" && ex.type === "Business") {
                        const d = getDate(ex.date);
                        if (d && d >= b.start && d <= b.end) {
                            bucketExpenses += Number(ex.amount || 0);
                        }
                    }
                });

                rows.push([
                    b.full,
                    b.sales.toFixed(2),
                    b.profit.toFixed(2),
                    b.orders,
                    (b.orders ? b.sales / b.orders : 0).toFixed(2),
                    bucketExpenses.toFixed(2),
                    (b.profit - bucketExpenses).toFixed(2)
                ]);
            });

            let overallExpenses = 0;
            userExpenses.forEach(ex => {
                if (ex.status === "Paid" && ex.type === "Business") {
                    const d = getDate(ex.date);
                    if (d && d >= range.from && d <= range.to) {
                        overallExpenses += Number(ex.amount || 0);
                    }
                }
            });

            rows.push([
                "Total",
                total.sales.toFixed(2),
                total.profit.toFixed(2),
                total.orders,
                (total.orders ? total.sales / total.orders : 0).toFixed(2),
                overallExpenses.toFixed(2),
                (total.profit - overallExpenses).toFixed(2)
            ]);

            const csv = rows.map(row =>
                row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
            ).join("\n");

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `AccountPro-Report-${toInput(range.from)}_to_${toInput(range.to)}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });


        /* =================================================
           REFRESH / INIT
        ================================================= */

        function refreshReports() {
            renderStats();
            renderCharts();
            renderTable();
            renderTopProducts();
            renderLowStock();
            loadNotifications();
        }

        updateRangeLabel();
        refreshReports();

        window.addEventListener("storage", function (event) {
            if (event.key === KEYS.theme) {
                applyTheme();
                renderCharts();
                return;
            }
            if (
                !event.key ||
                event.key === KEYS.salesStore ||
                event.key === KEYS.productsStore ||
                event.key === KEYS.notificationsStore ||
                event.key === KEYS.expensesStore
            ) {
                refreshReports();
            }
        });

        console.log("AccountPro Reports ready. Account:", uid);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startReports);
    } else {
        startReports();
    }

})();

/* If the browser restores this page from the back/forward
   cache, reload so the numbers are current. */
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});

/* If the currency is changed in another tab, reload so every
   amount on this page is shown in the new currency. */
window.addEventListener("storage", function (event) {
    if (event.key === "accountProCurrencyByUser") {
        window.location.reload();
    }
});

/* =================================================
   SIDEBAR MOBILE OVERLAY
================================================= */
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const mobileBtn = document.getElementById("mobile-menu");

    if (!sidebar || !mobileBtn) return;

    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
    }

    mobileBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", function () {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });
});