/* =========================================================
   ACCOUNT PRO
   DASHBOARD.JS
   LOCAL STORAGE VERSION
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       START
    ===================================================== */

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

        function getArray(key) {
            const value = safeParse(
                localStorage.getItem(key),
                []
            );

            return Array.isArray(value) ? value : [];
        }

        function setArray(key, value) {
            try {
                localStorage.setItem(
                    key,
                    JSON.stringify(value)
                );
            } catch (error) {
                console.error(
                    "Cannot save localStorage:",
                    error
                );
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
            return (Number(value) || 0)
                .toLocaleString("en-US");
        }

        function setText(id, value) {
            const el = $(id);

            if (el) {
                el.textContent = value;
            }
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

            if (!value) {
                return null;
            }

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return null;
            }

            return date;
        }


        /* =================================================
           LOCAL STORAGE KEYS
        ================================================= */

        const KEYS = {
            loggedIn: "accountProLoggedIn",
            currentUser: "accountProCurrentUser",

            products: "products",
            sales: "sales",

            notifications:
                "accountProNotifications",

            activities:
                "accountProActivities",

            theme:
                "dashboardTheme"
        };


/* =================================================
   AUTH
================================================= */

const loggedIn =
    localStorage.getItem(KEYS.loggedIn);

const currentUser =
    safeParse(
        localStorage.getItem(KEYS.currentUser),
        null
    );

// User must be logged in
if (loggedIn !== "true" || !currentUser) {
    window.location.href = "index.html";
    return;
}



        /* =================================================
           USER
        ================================================= */

        function loadUser() {

            const nameEl =
                $("navbar-user-name");

            const avatarEl =
                $("user-avatar");

            const greetingEl =
                $("greeting");

            const fullName =
                String(
                    currentUser.fullName ||
                    currentUser.name ||
                    "Admin User"
                ).trim();

            if (nameEl) {
                nameEl.textContent =
                    fullName;
            }

            if (avatarEl) {

                const parts =
                    fullName
                        .split(/\s+/)
                        .filter(Boolean);

                let initials = "U";

                if (parts.length >= 2) {

                    initials =
                        parts[0][0] +
                        parts[1][0];

                } else if (parts.length === 1) {

                    initials =
                        parts[0][0];
                }

                avatarEl.textContent =
                    initials.toUpperCase();
            }

            if (greetingEl) {

                const hour =
                    new Date().getHours();

                let greeting =
                    "Good night";

                if (
                    hour >= 5 &&
                    hour < 12
                ) {
                    greeting =
                        "Good morning";

                } else if (
                    hour >= 12 &&
                    hour < 18
                ) {
                    greeting =
                        "Good afternoon";

                } else if (
                    hour >= 18 &&
                    hour < 22
                ) {
                    greeting =
                        "Good evening";
                }

                greetingEl.textContent =
                    `${greeting}, ${fullName}`;
            }
        }

        loadUser();


        /* =================================================
           INITIAL LOCAL DATA
        ================================================= */

        function initializeStorage() {

            if (
                !localStorage.getItem(
                    KEYS.products
                )
            ) {
                setArray(
                    KEYS.products,
                    []
                );
            }

            if (
                !localStorage.getItem(
                    KEYS.sales
                )
            ) {
                setArray(
                    KEYS.sales,
                    []
                );
            }

            if (
                !localStorage.getItem(
                    KEYS.notifications
                )
            ) {
                setArray(
                    KEYS.notifications,
                    []
                );
            }

            if (
                !localStorage.getItem(
                    KEYS.activities
                )
            ) {
                setArray(
                    KEYS.activities,
                    []
                );
            }
        }

        initializeStorage();


        /* =================================================
           THEME
        ================================================= */

        const darkModeBtn =
            $("dark-mode-btn");

        const themeIcon =
            $("theme-icon");

        function applyTheme() {

            const dark =
                localStorage.getItem(
                    KEYS.theme
                ) === "dark";

            document.body.classList.toggle(
                "dark",
                dark
            );

            if (themeIcon) {

                themeIcon.className =
                    dark
                        ? "fa-regular fa-moon"
                        : "fa-regular fa-sun";
            }
        }

        applyTheme();


        if (darkModeBtn) {

            darkModeBtn.addEventListener(
                "click",
                function () {

                    const dark =
                        !document.body.classList.contains(
                            "dark"
                        );

                    document.body.classList.toggle(
                        "dark",
                        dark
                    );

                    localStorage.setItem(
                        KEYS.theme,
                        dark
                            ? "dark"
                            : "light"
                    );

                    if (themeIcon) {

                        themeIcon.className =
                            dark
                                ? "fa-regular fa-moon"
                                : "fa-regular fa-sun";
                    }
                }
            );
        }


        /* =================================================
           LOGOUT
        ================================================= */

        const logoutBtn =
            $("logout-btn");

        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                function () {

                    const confirmed =
                        window.confirm(
                            "Are you sure you want to logout?"
                        );

                    if (!confirmed) {
                        return;
                    }

                    localStorage.removeItem(
                        KEYS.loggedIn
                    );

                    localStorage.removeItem(
                        KEYS.currentUser
                    );

                    /*
                     * اگر index.html داری،
                     * به Login برمی‌گردد.
                     */

                    window.location.href =
                        "index.html";
                }
            );
        }


        /* =================================================
           MOBILE SIDEBAR
        ================================================= */

        const sidebar =
            $("sidebar");

        const mobileMenu =
            $("mobile-menu");

        if (
            sidebar &&
            mobileMenu
        ) {

            mobileMenu.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    sidebar.classList.toggle(
                        "open"
                    );
                }
            );


            document.addEventListener(
                "click",
                function (event) {

                    if (
                        window.innerWidth <= 800 &&
                        sidebar.classList.contains(
                            "open"
                        ) &&
                        !sidebar.contains(
                            event.target
                        ) &&
                        !mobileMenu.contains(
                            event.target
                        )
                    ) {

                        sidebar.classList.remove(
                            "open"
                        );
                    }
                }
            );
        }


        /* =================================================
           DATE HELPERS
        ================================================= */

        function sameDay(a, b) {

            return (
                a.getFullYear() ===
                    b.getFullYear() &&

                a.getMonth() ===
                    b.getMonth() &&

                a.getDate() ===
                    b.getDate()
            );
        }


        function isToday(date) {

            if (!date) {
                return false;
            }

            return sameDay(
                date,
                new Date()
            );
        }


        function isThisWeek(date) {

            if (!date) {
                return false;
            }

            const now =
                new Date();

            const start =
                new Date(now);

            start.setHours(
                0,
                0,
                0,
                0
            );

            let day =
                start.getDay();

            if (day === 0) {
                day = 7;
            }

            start.setDate(
                start.getDate() -
                (day - 1)
            );

            return date >= start;
        }


        function isThisMonth(date) {

            if (!date) {
                return false;
            }

            const now =
                new Date();

            return (
                date.getFullYear() ===
                    now.getFullYear() &&

                date.getMonth() ===
                    now.getMonth()
            );
        }


        /* =================================================
           SALES HELPERS
        ================================================= */

        function saleDate(sale) {

            return getDate(
                sale.date ||
                sale.createdAt ||
                sale.created_at ||
                sale.saleDate
            );
        }


        function saleQuantity(sale) {

            const quantity =
                sale.quantity ??
                sale.qty ??
                sale.units ??
                1;

            return Number(quantity) || 0;
        }


        function saleTotal(sale) {

            if (
                sale.total !== undefined &&
                sale.total !== null
            ) {

                return Number(
                    sale.total
                ) || 0;
            }

            const quantity =
                saleQuantity(sale);

            const price =
                Number(
                    sale.sellingPrice ??
                    sale.price ??
                    sale.unitPrice ??
                    0
                ) || 0;

            return quantity * price;
        }


        function saleProfit(sale) {

            if (
                sale.profit !== undefined &&
                sale.profit !== null
            ) {

                return Number(
                    sale.profit
                ) || 0;
            }

            const quantity =
                saleQuantity(sale);

            const selling =
                Number(
                    sale.sellingPrice ??
                    sale.price ??
                    sale.unitPrice ??
                    0
                ) || 0;

            const cost =
                Number(
                    sale.costPrice ??
                    sale.cost ??
                    0
                ) || 0;

            return (
                selling - cost
            ) * quantity;
        }


        /* =================================================
           STATISTICS
        ================================================= */

        function loadStatistics() {

            const sales =
                getArray(KEYS.sales);

            const products =
                getArray(KEYS.products);

            let todaySales = 0;
            let todayProfit = 0;

            let weeklySales = 0;
            let weeklyProfit = 0;

            let monthlySales = 0;
            let monthlyProfit = 0;

            let totalSales = 0;

            for (
                const sale of sales
            ) {

                const date =
                    saleDate(sale);

                const total =
                    saleTotal(sale);

                const profit =
                    saleProfit(sale);

                totalSales +=
                    total;

                if (
                    isToday(date)
                ) {

                    todaySales +=
                        total;

                    todayProfit +=
                        profit;
                }

                if (
                    isThisWeek(date)
                ) {

                    weeklySales +=
                        total;

                    weeklyProfit +=
                        profit;
                }

                if (
                    isThisMonth(date)
                ) {

                    monthlySales +=
                        total;

                    monthlyProfit +=
                        profit;
                }
            }


            const activeProducts =
                products.filter(
                    product => {

                        return Number(
                            product.stock ??
                            0
                        ) > 0;
                    }
                ).length;


            setText(
                "today-sales",
                money(todaySales)
            );

            setText(
                "today-profit",
                money(todayProfit)
            );

            setText(
                "weekly-sales",
                money(weeklySales)
            );

            setText(
                "weekly-profit",
                money(weeklyProfit)
            );

            setText(
                "monthly-sales",
                money(monthlySales)
            );

            setText(
                "monthly-profit",
                money(monthlyProfit)
            );

            setText(
                "total-sales",
                money(totalSales)
            );

            setText(
                "total-orders",
                num(sales.length)
            );

            setText(
                "average-order",
                money(
                    sales.length
                        ? totalSales /
                          sales.length
                        : 0
                )
            );

            setText(
                "active-products",
                num(activeProducts)
            );
        }


        /* =================================================
           LOW STOCK
        ================================================= */

        function loadLowStock() {

            const container =
                $("low-stock-list");

            if (!container) {
                return;
            }

            const products =
                getArray(KEYS.products);

            const lowStock =
                products
                    .filter(
                        product => {

                            const stock =
                                Number(
                                    product.stock ??
                                    0
                                );

                            const minimum =
                                Number(
                                    product.minStock ??
                                    product.minimumStock ??
                                    product.min_stock ??
                                    5
                                );

                            return (
                                stock <=
                                minimum
                            );
                        }
                    )
                    .slice(0, 5);


            if (
                lowStock.length === 0
            ) {

                container.innerHTML = `
                    <div class="empty-state">
                        No low-stock products.
                    </div>
                `;

                return;
            }


            container.innerHTML =
                lowStock
                    .map(
                        product => {

                            const stock =
                                Number(
                                    product.stock ??
                                    0
                                );

                            const minimum =
                                Number(
                                    product.minStock ??
                                    product.minimumStock ??
                                    product.min_stock ??
                                    5
                                );

                            return `
                                <div class="stock-item">

                                    <div>
                                        <div class="stock-name">
                                            ${escapeHTML(
                                                product.name ||
                                                "Unknown product"
                                            )}
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
                        }
                    )
                    .join("");
        }


        /* =================================================
           BEST SELLING
        ================================================= */

        function loadBestSelling() {

            const container =
                $("best-selling-list");

            if (!container) {
                return;
            }

            const sales =
                getArray(KEYS.sales);

            const map =
                new Map();


            for (
                const sale of sales
            ) {

                const date =
                    saleDate(sale);

                if (
                    !isThisMonth(date)
                ) {
                    continue;
                }

                const name =
                    String(
                        sale.product ||
                        sale.productName ||
                        "Unknown product"
                    );

                const quantity =
                    saleQuantity(sale);

                const revenue =
                    saleTotal(sale);

                const profit =
                    saleProfit(sale);


                if (
                    !map.has(name)
                ) {

                    map.set(
                        name,
                        {
                            name,
                            quantity: 0,
                            revenue: 0,
                            profit: 0
                        }
                    );
                }


                const item =
                    map.get(name);

                item.quantity +=
                    quantity;

                item.revenue +=
                    revenue;

                item.profit +=
                    profit;
            }


            const best =
                Array
                    .from(
                        map.values()
                    )
                    .sort(
                        (a, b) =>
                            b.quantity -
                            a.quantity
                    )
                    .slice(0, 5);


            if (
                best.length === 0
            ) {

                container.innerHTML = `
                    <div class="empty-state">
                        No sales data yet.
                    </div>
                `;

                return;
            }


            container.innerHTML =
                best
                    .map(
                        item => `
                            <div class="best-item">

                                <div>

                                    <div class="best-name">
                                        ${escapeHTML(
                                            item.name
                                        )}
                                    </div>

                                    <div class="best-meta">
                                        ${num(
                                            item.quantity
                                        )}
                                        units ·
                                        ${money(
                                            item.revenue
                                        )}
                                    </div>

                                </div>

                                <strong>
                                    ${money(
                                        item.profit
                                    )}
                                </strong>

                            </div>
                        `
                    )
                    .join("");
        }


        /* =================================================
           RECENT SALES
        ================================================= */

        function loadRecentSales() {

            const body =
                $("recent-sales-body");

            if (!body) {
                return;
            }

            const sales =
                getArray(KEYS.sales);

            const recent =
                [...sales]
                    .sort(
                        (a, b) => {

                            const dateA =
                                saleDate(a);

                            const dateB =
                                saleDate(b);

                            return (
                                (
                                    dateB?.getTime() ||
                                    0
                                ) -
                                (
                                    dateA?.getTime() ||
                                    0
                                )
                            );
                        }
                    )
                    .slice(0, 5);


            if (
                recent.length === 0
            ) {

                body.innerHTML = `
                    <tr>
                        <td
                            colspan="8"
                            style="text-align:center;"
                        >
                            No sales yet.
                        </td>
                    </tr>
                `;

                return;
            }


            body.innerHTML =
                recent
                    .map(
                        sale => {

                            const invoice =
                                sale.invoice ||
                                sale.invoiceNumber ||
                                "-";

                            const customer =
                                sale.customer ||
                                sale.customerName ||
                                "-";

                            const product =
                                sale.product ||
                                sale.productName ||
                                "-";

                            const quantity =
                                saleQuantity(sale);

                            const total =
                                saleTotal(sale);

                            const profit =
                                saleProfit(sale);

                            const date =
                                saleDate(sale);

                            const statusText =
                                String(
                                    sale.status ||
                                    "Completed"
                                );

                            const lower =
                                statusText
                                    .toLowerCase();

                            let statusClass =
                                "completed";

                            if (
                                lower.includes(
                                    "pending"
                                )
                            ) {
                                statusClass =
                                    "pending";

                            } else if (
                                lower.includes(
                                    "cancel"
                                )
                            ) {
                                statusClass =
                                    "cancelled";
                            }


                            return `
                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            invoice
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            customer
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            product
                                        )}
                                    </td>

                                    <td>
                                        ${quantity}
                                    </td>

                                    <td>
                                        ${money(
                                            total
                                        )}
                                    </td>

                                    <td>
                                        ${money(
                                            profit
                                        )}
                                    </td>

                                    <td>
                                        ${
                                            date
                                                ? date.toLocaleDateString()
                                                : "-"
                                        }
                                    </td>

                                    <td>
                                        <span
                                            class="status ${statusClass}"
                                        >
                                            ${escapeHTML(
                                                statusText
                                            )}
                                        </span>
                                    </td>

                                </tr>
                            `;
                        }
                    )
                    .join("");
        }


        /* =================================================
           ACTIVITIES
        ================================================= */

        function loadActivities() {

            const container =
                $("activity-list");

            if (!container) {
                return;
            }

            const activities =
                getArray(
                    KEYS.activities
                );


            const recent =
                [...activities]
                    .sort(
                        (a, b) => {

                            const dateA =
                                getDate(
                                    a.date ||
                                    a.createdAt
                                );

                            const dateB =
                                getDate(
                                    b.date ||
                                    b.createdAt
                                );

                            return (
                                (
                                    dateB?.getTime() ||
                                    0
                                ) -
                                (
                                    dateA?.getTime() ||
                                    0
                                )
                            );
                        }
                    )
                    .slice(0, 6);


            if (
                recent.length === 0
            ) {

                container.innerHTML = `
                    <div class="empty-state">
                        No recent activity.
                    </div>
                `;

                return;
            }


            container.innerHTML =
                recent
                    .map(
                        activity => {

                            const date =
                                getDate(
                                    activity.date ||
                                    activity.createdAt
                                );

                            return `
                                <div class="activity-item">

                                    <div class="activity-dot">
                                        <i class="fa-solid fa-circle"></i>
                                    </div>

                                    <div class="activity-content">

                                        <strong>
                                            ${escapeHTML(
                                                activity.title ||
                                                "Activity"
                                            )}
                                        </strong>

                                        <span>
                                            ${escapeHTML(
                                                activity.message ||
                                                ""
                                            )}
                                        </span>

                                        <div class="activity-time">
                                            ${
                                                date
                                                    ? date.toLocaleString()
                                                    : ""
                                            }
                                        </div>

                                    </div>

                                </div>
                            `;
                        }
                    )
                    .join("");
        }


        /* =================================================
           NOTIFICATIONS
        ================================================= */

        function loadNotifications() {

            const list =
                $("notification-list");

            const count =
                $("notification-count");

            if (!list) {
                return;
            }

            const notifications =
                getArray(
                    KEYS.notifications
                );


            const unread =
                notifications.filter(
                    notification =>
                        !notification.read
                );


            if (count) {

                count.textContent =
                    unread.length;

                count.classList.toggle(
                    "show",
                    unread.length > 0
                );
            }


            if (
                notifications.length === 0
            ) {

                list.innerHTML = `
                    <div class="no-notifications">
                        No notifications
                    </div>
                `;

                return;
            }


            list.innerHTML =
                notifications
                    .slice(0, 8)
                    .map(
                        (
                            notification,
                            index
                        ) => {

                            const date =
                                getDate(
                                    notification.date ||
                                    notification.createdAt
                                );

                            return `
                                <div
                                    class="notification-item ${
                                        notification.read
                                            ? ""
                                            : "unread"
                                    }"
                                    data-index="${index}"
                                >

                                    <div class="notification-title">
                                        ${escapeHTML(
                                            notification.title ||
                                            "Notification"
                                        )}
                                    </div>

                                    <div class="notification-message">
                                        ${escapeHTML(
                                            notification.message ||
                                            ""
                                        )}
                                    </div>

                                    <div class="notification-date">
                                        ${
                                            date
                                                ? date.toLocaleString()
                                                : ""
                                        }
                                    </div>

                                </div>
                            `;
                        }
                    )
                    .join("");


            list
                .querySelectorAll(
                    ".notification-item"
                )
                .forEach(
                    item => {

                        item.addEventListener(
                            "click",
                            function () {

                                const index =
                                    Number(
                                        item.dataset.index
                                    );

                                if (
                                    notifications[index]
                                ) {

                                    notifications[index]
                                        .read = true;

                                    setArray(
                                        KEYS.notifications,
                                        notifications
                                    );

                                    loadNotifications();
                                }
                            }
                        );
                    }
                );
        }


        /* =================================================
           NOTIFICATION BUTTON
        ================================================= */

        const notificationBtn =
            $("notification-btn");

        const notificationPanel =
            $("notification-panel");

        if (
            notificationBtn &&
            notificationPanel
        ) {

            notificationBtn.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    notificationPanel.classList.toggle(
                        "show"
                    );
                }
            );


            document.addEventListener(
                "click",
                function (event) {

                    if (
                        !notificationPanel.contains(
                            event.target
                        ) &&
                        !notificationBtn.contains(
                            event.target
                        )
                    ) {

                        notificationPanel.classList.remove(
                            "show"
                        );
                    }
                }
            );
        }


        /* =================================================
           MARK ALL READ
        ================================================= */

        const markAllRead =
            $("mark-all-read");

        if (markAllRead) {

            markAllRead.addEventListener(
                "click",
                function () {

                    const notifications =
                        getArray(
                            KEYS.notifications
                        );

                    notifications.forEach(
                        notification => {
                            notification.read =
                                true;
                        }
                    );

                    setArray(
                        KEYS.notifications,
                        notifications
                    );

                    loadNotifications();
                }
            );
        }


        /* =================================================
           SEARCH
        ================================================= */

        const searchInput =
            $("global-search");

        const searchResults =
            $("search-results");


        function performSearch(
            keyword
        ) {

            if (
                !searchResults
            ) {
                return;
            }

            keyword =
                String(
                    keyword || ""
                )
                    .trim()
                    .toLowerCase();


            if (!keyword) {

                searchResults.innerHTML =
                    "";

                searchResults.classList.remove(
                    "show"
                );

                return;
            }


            const products =
                getArray(
                    KEYS.products
                );

            const sales =
                getArray(
                    KEYS.sales
                );

            const results = [];


            for (
                const product of products
            ) {

                const name =
                    String(
                        product.name ||
                        ""
                    );

                if (
                    name
                        .toLowerCase()
                        .includes(
                            keyword
                        )
                ) {

                    results.push({
                        type: "Product",
                        title: name,
                        data: product
                    });
                }
            }


            for (
                const sale of sales
            ) {

                const invoice =
                    String(
                        sale.invoice ||
                        sale.invoiceNumber ||
                        ""
                    );

                const customer =
                    String(
                        sale.customer ||
                        sale.customerName ||
                        ""
                    );

                const product =
                    String(
                        sale.product ||
                        sale.productName ||
                        ""
                    );


                if (
                    invoice
                        .toLowerCase()
                        .includes(keyword) ||

                    customer
                        .toLowerCase()
                        .includes(keyword) ||

                    product
                        .toLowerCase()
                        .includes(keyword)
                ) {

                    results.push({
                        type: "Sale",

                        title:
                            invoice ||
                            customer ||
                            product,

                        data: sale
                    });
                }
            }


            if (
                results.length === 0
            ) {

                searchResults.innerHTML = `
                    <div class="search-empty">
                        No results found
                    </div>
                `;

            } else {

                searchResults.innerHTML =
                    results
                        .slice(0, 8)
                        .map(
                            (
                                result,
                                index
                            ) => `
                                <div
                                    class="search-result"
                                    data-index="${index}"
                                >

                                    <div class="search-result-title">
                                        ${escapeHTML(
                                            result.title
                                        )}
                                    </div>

                                    <div class="search-result-type">
                                        ${escapeHTML(
                                            result.type
                                        )}
                                    </div>

                                </div>
                            `
                        )
                        .join("");


                searchResults
                    .querySelectorAll(
                        ".search-result"
                    )
                    .forEach(
                        item => {

                            item.addEventListener(
                                "click",
                                function () {

                                    const index =
                                        Number(
                                            item.dataset.index
                                        );

                                    showSearchInfo(
                                        results[index]
                                    );
                                }
                            );
                        }
                    );
            }


            searchResults.classList.add(
                "show"
            );
        }


        function showSearchInfo(
            result
        ) {

            if (!result) {
                return;
            }

            const data =
                result.data;


            if (
                result.type ===
                "Product"
            ) {

                window.alert(
                    "Product: " +
                    (
                        data.name ||
                        "-"
                    ) +
                    "\nStock: " +
                    (
                        data.stock ||
                        0
                    )
                );

            } else {

                window.alert(
                    "Invoice: " +
                    (
                        data.invoice ||
                        data.invoiceNumber ||
                        "-"
                    ) +

                    "\nCustomer: " +
                    (
                        data.customer ||
                        data.customerName ||
                        "-"
                    ) +

                    "\nTotal: " +
                    money(
                        saleTotal(data)
                    )
                );
            }


            searchResults?.classList.remove(
                "show"
            );

            if (searchInput) {
                searchInput.value = "";
            }
        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function () {

                    performSearch(
                        searchInput.value
                    );
                }
            );
        }


        document.addEventListener(
            "click",
            function (event) {

                if (
                    searchResults &&
                    searchInput &&
                    !searchResults.contains(
                        event.target
                    ) &&
                    !searchInput.contains(
                        event.target
                    )
                ) {

                    searchResults.classList.remove(
                        "show"
                    );
                }
            }
        );


        /* =================================================
           EXPORT
        ================================================= */

        const exportBtn =
            $("export-btn");

        if (exportBtn) {

            exportBtn.addEventListener(
                "click",
                function () {

                    const sales =
                        getArray(
                            KEYS.sales
                        );


                    if (
                        sales.length === 0
                    ) {

                        window.alert(
                            "There are no sales to export."
                        );

                        return;
                    }


                    const rows = [
                        [
                            "Invoice",
                            "Customer",
                            "Product",
                            "Quantity",
                            "Total",
                            "Profit",
                            "Date",
                            "Status"
                        ]
                    ];


                    sales.forEach(
                        sale => {

                            rows.push([
                                sale.invoice ||
                                sale.invoiceNumber ||
                                "",

                                sale.customer ||
                                sale.customerName ||
                                "",

                                sale.product ||
                                sale.productName ||
                                "",

                                saleQuantity(
                                    sale
                                ),

                                saleTotal(
                                    sale
                                ),

                                saleProfit(
                                    sale
                                ),

                                saleDate(
                                    sale
                                )?.toLocaleString() ||
                                "",

                                sale.status ||
                                "Completed"
                            ]);
                        }
                    );


                    const csv =
                        rows
                            .map(
                                row =>
                                    row
                                        .map(
                                            cell =>
                                                `"${String(
                                                    cell ?? ""
                                                ).replace(
                                                    /"/g,
                                                    '""'
                                                )}"`
                                        )
                                        .join(",")
                            )
                            .join("\n");


                    const blob =
                        new Blob(
                            [csv],
                            {
                                type:
                                    "text/csv;charset=utf-8;"
                            }
                        );


                    const url =
                        URL.createObjectURL(
                            blob
                        );


                    const link =
                        document.createElement(
                            "a"
                        );

                    link.href =
                        url;

                    link.download =
                        "AccountPro-Sales.csv";

                    document.body.appendChild(
                        link
                    );

                    link.click();

                    link.remove();

                    setTimeout(
                        () => {
                            URL.revokeObjectURL(
                                url
                            );
                        },
                        1000
                    );
                }
            );
        }


        /* =================================================
           NEW SALE
        ================================================= */

        const newSaleBtn =
            $("new-sale-btn");


        if (newSaleBtn) {

            newSaleBtn.addEventListener(
                "click",
                function () {

                    const products =
                        getArray(
                            KEYS.products
                        );


                    /*
                     * فعلاً Backend نداریم.
                     * برای تست Local Storage،
                     * یک فرم ساده با prompt باز می‌کنیم.
                     */

                    const productName =
                        window.prompt(
                            "Product name:"
                        );

                    if (
                        !productName ||
                        !productName.trim()
                    ) {
                        return;
                    }


                    const customer =
                        window.prompt(
                            "Customer name:",
                            "Walk-in Customer"
                        ) ||
                        "Walk-in Customer";


                    const quantity =
                        Number(
                            window.prompt(
                                "Quantity:",
                                "1"
                            )
                        );


                    if (
                        !Number.isFinite(
                            quantity
                        ) ||
                        quantity <= 0
                    ) {

                        window.alert(
                            "Invalid quantity."
                        );

                        return;
                    }


                    const price =
                        Number(
                            window.prompt(
                                "Selling price:",
                                "0"
                            )
                        );


                    if (
                        !Number.isFinite(
                            price
                        ) ||
                        price < 0
                    ) {

                        window.alert(
                            "Invalid price."
                        );

                        return;
                    }


                    /*
                     * پیدا کردن محصول برای cost price
                     */

                    const product =
                        products.find(
                            item =>
                                String(
                                    item.name ||
                                    ""
                                )
                                    .toLowerCase() ===
                                productName
                                    .trim()
                                    .toLowerCase()
                        );


                    const cost =
                        Number(
                            product?.costPrice ??
                            product?.cost ??
                            0
                        ) || 0;


                    const now =
                        new Date();


                    const invoice =
                        "INV-" +
                        now
                            .getTime();


                    const sale = {

                        id:
                            "sale-" +
                            now.getTime(),

                        invoice,

                        customer,

                        product:
                            productName.trim(),

                        quantity,

                        sellingPrice:
                            price,

                        costPrice:
                            cost,

                        total:
                            price *
                            quantity,

                        profit:
                            (
                                price -
                                cost
                            ) *
                            quantity,

                        status:
                            "Completed",

                        date:
                            now.toISOString(),

                        createdAt:
                            now.toISOString()
                    };


                    const sales =
                        getArray(
                            KEYS.sales
                        );

                    sales.push(
                        sale
                    );

                    setArray(
                        KEYS.sales,
                        sales
                    );


                    /*
                     * Activity
                     */

                    const activities =
                        getArray(
                            KEYS.activities
                        );

                    activities.unshift({

                        id:
                            "activity-" +
                            now.getTime(),

                        title:
                            "New sale created",

                        message:
                            `${productName} · ${money(
                                sale.total
                            )}`,

                        date:
                            now.toISOString()
                    });


                    setArray(
                        KEYS.activities,
                        activities.slice(
                            0,
                            50
                        )
                    );


                    /*
                     * Notification
                     */

                    const notifications =
                        getArray(
                            KEYS.notifications
                        );

                    notifications.unshift({

                        id:
                            "notification-" +
                            now.getTime(),

                        title:
                            "New sale",

                        message:
                            `${productName} sold for ${money(
                                sale.total
                            )}`,

                        read:
                            false,

                        date:
                            now.toISOString()
                    });


                    setArray(
                        KEYS.notifications,
                        notifications.slice(
                            0,
                            50
                        )
                    );


                    /*
                     * اگر محصول در localStorage
                     * موجود باشد، موجودی آن را کم کن.
                     */

                    if (product) {

                        const index =
                            products.indexOf(
                                product
                            );

                        const oldStock =
                            Number(
                                product.stock ||
                                0
                            );

                        products[index]
                            .stock =
                            Math.max(
                                0,
                                oldStock -
                                quantity
                            );

                        setArray(
                            KEYS.products,
                            products
                        );
                    }


                    refreshDashboard();

                    window.alert(
                        "Sale created successfully.\nInvoice: " +
                        invoice
                    );
                }
            );
        }


        /* =================================================
           VIEW ALL SALES
        ================================================= */

        const viewAllSales =
            $("view-all-sales");

        if (viewAllSales) {

            viewAllSales.addEventListener(
                "click",
                function () {

                    const sales =
                        getArray(
                            KEYS.sales
                        );

                    if (
                        sales.length === 0
                    ) {

                        window.alert(
                            "No sales found."
                        );

                        return;
                    }


                    let text =
                        "Recent Sales\n\n";


                    sales
                        .slice()
                        .reverse()
                        .slice(0, 10)
                        .forEach(
                            sale => {

                                text +=
                                    (
                                        sale.invoice ||
                                        "-"
                                    ) +
                                    " | " +
                                    (
                                        sale.product ||
                                        "-"
                                    ) +
                                    " | " +
                                    money(
                                        saleTotal(
                                            sale
                                        )
                                    ) +
                                    "\n";
                            }
                        );


                    window.alert(
                        text
                    );
                }
            );
        }


        /* =================================================
           SIDEBAR FUTURE LINKS
        ================================================= */

        document
            .querySelectorAll(
                ".future-link"
            )
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            const module =
                                link.dataset.module ||
                                "Module";

                            window.alert(
                                `${module} is not connected yet.\n\n` +
                                "It will be connected to the Local Storage modules first, " +
                                "then to Backend."
                            );


                            if (
                                window.innerWidth <=
                                800 &&
                                sidebar
                            ) {

                                sidebar.classList.remove(
                                    "open"
                                );
                            }
                        }
                    );
                }
            );


        /* =================================================
           CHARTS
        ================================================= */

        let salesChart = null;
        let profitChart = null;


        function getLast14Days() {

            const days = [];

            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );


            for (
                let i = 13;
                i >= 0;
                i--
            ) {

                const date =
                    new Date(
                        today
                    );

                date.setDate(
                    today.getDate() -
                    i
                );

                days.push(
                    date
                );
            }

            return days;
        }


        function loadCharts() {

            if (
                typeof Chart ===
                "undefined"
            ) {

                console.warn(
                    "Chart.js is not loaded."
                );

                return;
            }


            const sales =
                getArray(
                    KEYS.sales
                );

            const days =
                getLast14Days();


            const labels =
                days.map(
                    date =>
                        date.toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric"
                            }
                        )
                );


            const salesData =
                days.map(
                    day => {

                        return sales.reduce(
                            (
                                total,
                                sale
                            ) => {

                                const date =
                                    saleDate(
                                        sale
                                    );

                                if (
                                    date &&
                                    sameDay(
                                        date,
                                        day
                                    )
                                ) {

                                    return (
                                        total +
                                        saleTotal(
                                            sale
                                        )
                                    );
                                }

                                return total;
                            },
                            0
                        );
                    }
                );


            const profitData =
                days.map(
                    day => {

                        return sales.reduce(
                            (
                                total,
                                sale
                            ) => {

                                const date =
                                    saleDate(
                                        sale
                                    );

                                if (
                                    date &&
                                    sameDay(
                                        date,
                                        day
                                    )
                                ) {

                                    return (
                                        total +
                                        saleProfit(
                                            sale
                                        )
                                    );
                                }

                                return total;
                            },
                            0
                        );
                    }
                );


            const salesCanvas =
                $("sales-chart");

            const profitCanvas =
                $("profit-chart");


            if (
                salesCanvas
            ) {

                if (
                    salesChart
                ) {
                    salesChart.destroy();
                }


                salesChart =
                    new Chart(
                        salesCanvas,
                        {
                            type: "line",

                            data: {

                                labels,

                                datasets: [
                                    {
                                        label:
                                            "Sales",

                                        data:
                                            salesData,

                                        borderColor:
                                            "#3158f5",

                                        backgroundColor:
                                            "rgba(49,88,245,0.08)",

                                        borderWidth:
                                            2,

                                        fill:
                                            true,

                                        tension:
                                            0.35,

                                        pointRadius:
                                            2,

                                        pointBackgroundColor:
                                            "#3158f5"
                                    }
                                ]
                            },

                            options: {

                                responsive:
                                    true,

                                maintainAspectRatio:
                                    false,

                                animation:
                                    false,

                                plugins: {

                                    legend: {
                                        display:
                                            false
                                    }
                                },

                                scales: {

                                    y: {
                                        beginAtZero:
                                            true,

                                        grid: {
                                            color:
                                                "rgba(0,0,0,.05)"
                                        },

                                        ticks: {
                                            font: {
                                                size:
                                                    8
                                            }
                                        }
                                    },

                                    x: {
                                        grid: {
                                            display:
                                                false
                                        },

                                        ticks: {
                                            font: {
                                                size:
                                                    7
                                            },

                                            maxTicksLimit:
                                                7
                                        }
                                    }
                                }
                            }
                        }
                    );
            }


            if (
                profitCanvas
            ) {

                if (
                    profitChart
                ) {
                    profitChart.destroy();
                }


                profitChart =
                    new Chart(
                        profitCanvas,
                        {
                            type: "line",

                            data: {

                                labels,

                                datasets: [
                                    {
                                        label:
                                            "Profit",

                                        data:
                                            profitData,

                                        borderColor:
                                            "#6447ef",

                                        backgroundColor:
                                            "rgba(100,71,239,0.08)",

                                        borderWidth:
                                            2,

                                        fill:
                                            true,

                                        tension:
                                            0.35,

                                        pointRadius:
                                            2,

                                        pointBackgroundColor:
                                            "#6447ef"
                                    }
                                ]
                            },

                            options: {

                                responsive:
                                    true,

                                maintainAspectRatio:
                                    false,

                                animation:
                                    false,

                                plugins: {

                                    legend: {
                                        display:
                                            false
                                    }
                                },

                                scales: {

                                    y: {
                                        beginAtZero:
                                            true,

                                        grid: {
                                            color:
                                                "rgba(0,0,0,.05)"
                                        },

                                        ticks: {
                                            font: {
                                                size:
                                                    8
                                            }
                                        }
                                    },

                                    x: {
                                        grid: {
                                            display:
                                                false
                                        },

                                        ticks: {
                                            font: {
                                                size:
                                                    7
                                            },

                                            maxTicksLimit:
                                                7
                                        }
                                    }
                                }
                            }
                        }
                    );
            }
        }


        /* =================================================
           REFRESH
        ================================================= */

        function refreshDashboard() {

            try {
                loadStatistics();
            } catch (error) {
                console.error(
                    "Statistics error:",
                    error
                );
            }


            try {
                loadLowStock();
            } catch (error) {
                console.error(
                    "Low stock error:",
                    error
                );
            }


            try {
                loadBestSelling();
            } catch (error) {
                console.error(
                    "Best selling error:",
                    error
                );
            }


            try {
                loadRecentSales();
            } catch (error) {
                console.error(
                    "Recent sales error:",
                    error
                );
            }


            try {
                loadActivities();
            } catch (error) {
                console.error(
                    "Activities error:",
                    error
                );
            }


            try {
                loadNotifications();
            } catch (error) {
                console.error(
                    "Notifications error:",
                    error
                );
            }


            try {
                loadCharts();
            } catch (error) {
                console.error(
                    "Charts error:",
                    error
                );
            }
        }


        /* =================================================
           STORAGE SYNC
        ================================================= */

        window.addEventListener(
            "storage",
            function () {

                refreshDashboard();
            }
        );


        /* =================================================
           INITIALIZE
        ================================================= */

        refreshDashboard();


        /*
         * فقط برای Sync سبک.
         * Chart هر بار بدون ضرورت ساخته نمی‌شود.
         */

        setInterval(
            function () {

                loadStatistics();
                loadLowStock();
                loadBestSelling();
                loadRecentSales();
                loadActivities();
                loadNotifications();

            },
            30000
        );


        /* =================================================
           DEBUG
        ================================================= */

        window.AccountPro = {

            refresh:
                refreshDashboard,

            getProducts:
                () =>
                    getArray(
                        KEYS.products
                    ),

            getSales:
                () =>
                    getArray(
                        KEYS.sales
                    ),

            getNotifications:
                () =>
                    getArray(
                        KEYS.notifications
                    ),

            getActivities:
                () =>
                    getArray(
                        KEYS.activities
                    ),

            clearSales:
                function () {

                    setArray(
                        KEYS.sales,
                        []
                    );

                    refreshDashboard();
                }
        };


        console.log(
            "AccountPro Dashboard ready."
        );
    }


    /* =====================================================
       SAFE START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startDashboard
        );

    } else {

        startDashboard();
    }

})();
