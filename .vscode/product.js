/* =========================================================
   ACCOUNT PRO
   PRODUCT.JS
   LOCAL STORAGE VERSION - PER ACCOUNT DATA
   ========================================================= */

(function () {
    "use strict";

    function startProducts() {

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


        /* =================================================
           KEYS - must match dashboard.js exactly so both
           pages read/write the same per-account data.
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
           ACCOUNT ID (identical logic to dashboard.js)
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
           ONE-TIME MIGRATION (same rule as dashboard.js -
           guarded by the shared flag so it only ever runs
           once across the whole app, on whichever page a
           user opens first).
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
           NAVBAR USER
        ================================================= */

        function loadUser() {

            const nameEl = $("navbar-user-name");
            const avatarEl = $("user-avatar");

            const fullName = String(
                currentUser.fullName || currentUser.name || "Admin User"
            ).trim();

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

                if (parts.length >= 2) {
                    initials = parts[0][0] + parts[1][0];
                } else if (parts.length === 1) {
                    initials = parts[0][0];
                }

                avatarEl.textContent = initials.toUpperCase();
            }
        }

        loadUser();


        /* =================================================
           INITIAL STORAGE (per account)
        ================================================= */

        const productsStore = getStore(KEYS.productsStore);
        if (!Array.isArray(productsStore[uid])) {
            productsStore[uid] = [];
            saveStore(KEYS.productsStore, productsStore);
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


        /* =================================================
           GLOBAL THEME (shared with Dashboard)
        ================================================= */

        const darkModeBtn = $("dark-mode-btn");
        const themeIcon = $("theme-icon");

        function applyTheme() {
            const dark = localStorage.getItem(KEYS.theme) === "dark";
            document.body.classList.toggle("dark", dark);

            if (themeIcon) {
                themeIcon.className = dark ? "fa-regular fa-moon" : "fa-regular fa-sun";
            }
        }

        applyTheme();

        if (darkModeBtn) {
            darkModeBtn.addEventListener("click", function () {
                const dark = !document.body.classList.contains("dark");
                document.body.classList.toggle("dark", dark);
                localStorage.setItem(KEYS.theme, dark ? "dark" : "light");

                if (themeIcon) {
                    themeIcon.className = dark ? "fa-regular fa-moon" : "fa-regular fa-sun";
                }
            });
        }

        window.addEventListener("storage", function (event) {
            if (event.key === KEYS.theme) applyTheme();
            if (!event.key || event.key === KEYS.productsStore) refreshAll();
        });


        /* =================================================
           LOGOUT
        ================================================= */

        const logoutBtn = $("logout-btn");

        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                const confirmed = window.confirm("Are you sure you want to logout?");
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
           NOTIFICATIONS / ACTIVITIES (per account)
        ================================================= */

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
            loadNotifications();
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
                if (
                    !notificationPanel.contains(event.target) &&
                    !notificationBtn.contains(event.target)
                ) {
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
           GLOBAL SEARCH (current account's products only)
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
            const results = [];

            for (const product of products) {
                const name = String(product.name || "");
                const category = String(product.category || "");

                if (
                    name.toLowerCase().includes(keyword) ||
                    category.toLowerCase().includes(keyword)
                ) {
                    results.push({ type: "Product", title: name, data: product });
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
                        const product = results[index]?.data;

                        if (product) {
                            $("f-search").value = product.name;
                            currentFilters.search = product.name.toLowerCase();
                            currentPage = 1;
                            renderTable();
                        }

                        searchResults.classList.remove("show");
                        if (searchInput) searchInput.value = "";
                    });
                });
            }

            searchResults.classList.add("show");
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
           PRODUCT HELPERS
        ================================================= */

        function getStatus(product) {
            const stock = Number(product.stock) || 0;
            const min = Number(product.minStock) || 0;

            if (stock === 0) return "Out of Stock";
            if (stock <= min) return "Low Stock";
            return "In Stock";
        }

        function statusClass(status) {
            if (status === "Out of Stock") return "outstock";
            if (status === "Low Stock") return "lowstock";
            return "instock";
        }

        function readImage(file) {
            return new Promise((resolve) => {
                if (!file) {
                    resolve(null);
                    return;
                }

                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
            });
        }


        /* =================================================
           STATE
        ================================================= */

        let currentFilters = { search: "", category: "", status: "" };
        let currentPage = 1;
        let editingId = null;
        const PAGE_SIZE = 8;


        /* =================================================
           SUMMARY CARDS (current account only)
        ================================================= */

        function refreshSummary() {
            const products = getUserArray(KEYS.productsStore, uid);

            let low = 0, available = 0, out = 0;

            products.forEach(product => {
                const status = getStatus(product);
                if (status === "Low Stock") low++;
                else if (status === "In Stock") available++;
                else out++;
            });

            $("s-total").textContent = products.length;
            $("s-low").textContent = low;
            $("s-avail").textContent = available;
            $("s-out").textContent = out;
        }


        /* =================================================
           TABLE RENDER (current account only)
        ================================================= */

        function getFilteredProducts() {
            const products = getUserArray(KEYS.productsStore, uid);

            return products.filter(product => {
                const name = String(product.name || "").toLowerCase();
                const category = String(product.category || "");
                const status = getStatus(product);

                const matchesSearch =
                    !currentFilters.search ||
                    name.includes(currentFilters.search) ||
                    category.toLowerCase().includes(currentFilters.search);

                const matchesCategory =
                    !currentFilters.category || category === currentFilters.category;

                const matchesStatus =
                    !currentFilters.status || status === currentFilters.status;

                return matchesSearch && matchesCategory && matchesStatus;
            });
        }

        function renderTable() {
            const body = $("prod-body");
            if (!body) return;

            const filtered = getFilteredProducts();
            const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

            if (currentPage > totalPages) currentPage = totalPages;

            const start = (currentPage - 1) * PAGE_SIZE;
            const pageItems = filtered.slice(start, start + PAGE_SIZE);

            if (filtered.length === 0) {
                body.innerHTML = `
                    <tr>
                        <td colspan="10">
                            <div class="empty-state">No products found. Add your first product above.</div>
                        </td>
                    </tr>
                `;
            } else {
                body.innerHTML = pageItems.map((product, index) => {
                    const status = getStatus(product);
                    const thumb = product.image
                        ? `<img class="prod-thumb" src="${product.image}" alt="${escapeHTML(product.name)}">`
                        : `<div class="prod-thumb-fallback">${escapeHTML((product.name || "?")[0] || "?").toUpperCase()}</div>`;

                    return `
                        <tr>
                            <td>${start + index + 1}</td>
                            <td>${thumb}</td>
                            <td>${escapeHTML(product.name)}</td>
                            <td><span class="cat-badge">${escapeHTML(product.category || "-")}</span></td>
                            <td>${money(product.costPrice)}</td>
                            <td>${money(product.price)}</td>
                            <td>${Number(product.stock) || 0}</td>
                            <td>${Number(product.minStock) || 0}</td>
                            <td><span class="status ${statusClass(status)}">${status}</span></td>
                            <td>
                                ${status !== "In Stock" ? `
                                    <button class="act-btn restock" data-id="${product.id}" title="Add stock">
                                        <i class="fa-solid fa-box-open"></i>
                                    </button>
                                ` : ""}
                                <button class="act-btn edit" data-id="${product.id}" title="Edit">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="act-btn del" data-id="${product.id}" title="Delete">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join("");

                body.querySelectorAll(".act-btn.restock").forEach(btn => {
                    btn.addEventListener("click", () => restockProduct(btn.dataset.id));
                });

                body.querySelectorAll(".act-btn.edit").forEach(btn => {
                    btn.addEventListener("click", () => startEdit(btn.dataset.id));
                });

                body.querySelectorAll(".act-btn.del").forEach(btn => {
                    btn.addEventListener("click", () => deleteProduct(btn.dataset.id));
                });
            }

            renderPagination(filtered.length, totalPages);
        }

        function renderPagination(totalItems, totalPages) {
            const container = $("pagination");
            if (!container) return;

            if (totalItems === 0) {
                container.innerHTML = "";
                return;
            }

            const start = (currentPage - 1) * PAGE_SIZE + 1;
            const end = Math.min(currentPage * PAGE_SIZE, totalItems);

            let buttons = "";
            for (let page = 1; page <= totalPages; page++) {
                buttons += `<button class="pg-btn ${page === currentPage ? "active" : ""}" data-page="${page}">${page}</button>`;
            }

            container.innerHTML = `
                <span>Showing ${start} to ${end} of ${totalItems} products</span>
                <div class="pg-btns">
                    <button class="pg-btn" id="pg-prev" ${currentPage === 1 ? "disabled" : ""}>
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    ${buttons}
                    <button class="pg-btn" id="pg-next" ${currentPage === totalPages ? "disabled" : ""}>
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            `;

            container.querySelectorAll(".pg-btn[data-page]").forEach(btn => {
                btn.addEventListener("click", () => {
                    currentPage = Number(btn.dataset.page);
                    renderTable();
                });
            });

            const prevBtn = $("pg-prev");
            const nextBtn = $("pg-next");

            if (prevBtn) prevBtn.addEventListener("click", () => {
                if (currentPage > 1) { currentPage--; renderTable(); }
            });

            if (nextBtn) nextBtn.addEventListener("click", () => {
                if (currentPage < totalPages) { currentPage++; renderTable(); }
            });
        }


        /* =================================================
           ADD / EDIT PRODUCT FORM
        ================================================= */

        const form = $("product-form");
        const submitBtn = $("p-submit");
        const cancelBtn = $("p-cancel");

        function fillForm(product) {
            $("p-name").value = product.name || "";
            $("p-category").value = product.category || "";
            $("p-cost").value = product.costPrice ?? "";
            $("p-price").value = product.price ?? "";
            $("p-stock").value = product.stock ?? "";
            $("p-min").value = product.minStock ?? "";
        }

        function clearForm() {
            form.reset();
            editingId = null;
            submitBtn.innerHTML = `<i class="fa-solid fa-plus"></i><span>Add Product</span>`;
            cancelBtn.style.display = "none";
        }

        function startEdit(id) {
            const products = getUserArray(KEYS.productsStore, uid);
            const product = products.find(p => String(p.id) === String(id));
            if (!product) return;

            editingId = id;
            fillForm(product);
            submitBtn.innerHTML = `<i class="fa-solid fa-check"></i><span>Update Product</span>`;
            cancelBtn.style.display = "inline-flex";
            document.querySelector(".add-panel").scrollIntoView({ behavior: "smooth", block: "start" });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener("click", clearForm);
        }

        function restockProduct(id) {
            const products = getUserArray(KEYS.productsStore, uid);
            const index = products.findIndex(p => String(p.id) === String(id));

            if (index === -1) {
                window.alert("Could not find this product. Please refresh the page and try again.");
                return;
            }

            const product = products[index];
            const currentStock = Number(product.stock) || 0;

            const input = window.prompt(
                `How many units of "${product.name}" are you adding to stock?\nCurrent stock: ${currentStock}`,
                "10"
            );

            if (input === null) return;

            const addQty = Number(input);

            if (!Number.isFinite(addQty) || addQty <= 0) {
                window.alert("Please enter a valid positive quantity.");
                return;
            }

            const newStock = currentStock + Math.floor(addQty);
            products[index] = { ...product, stock: newStock };

            setUserArray(KEYS.productsStore, uid, products);

            logActivity("Stock added", `${product.name} · +${Math.floor(addQty)} (now ${newStock})`);
            pushNotification("Stock updated", `"${product.name}" is back in stock (${newStock} available).`);

            if (editingId === id) clearForm();

            refreshAll();
        }

        function deleteProduct(id) {
            const products = getUserArray(KEYS.productsStore, uid);
            const product = products.find(p => String(p.id) === String(id));
            if (!product) return;

            const confirmed = window.confirm(`Delete "${product.name}"? This cannot be undone.`);
            if (!confirmed) return;

            const updated = products.filter(p => String(p.id) !== String(id));
            setUserArray(KEYS.productsStore, uid, updated);

            logActivity("Product deleted", product.name);
            pushNotification("Product removed", `${product.name} was deleted from your inventory.`);

            if (String(editingId) === String(id)) clearForm();

            refreshAll();
        }

        if (form) {
            form.addEventListener("submit", async function (event) {
                event.preventDefault();

                const name = $("p-name").value.trim();
                const category = $("p-category").value;
                const costPrice = Number($("p-cost").value);
                const price = Number($("p-price").value);
                const stock = Number($("p-stock").value);
                const minStock = Number($("p-min").value);
                const imageFile = $("p-image").files[0] || null;

                if (!name) {
                    window.alert("Please enter a product name.");
                    return;
                }

                if (!category) {
                    window.alert("Please select a category.");
                    return;
                }

                if (!Number.isFinite(costPrice) || costPrice < 0) {
                    window.alert("Please enter a valid purchase price.");
                    return;
                }

                if (!Number.isFinite(price) || price < 0) {
                    window.alert("Please enter a valid selling price.");
                    return;
                }

                if (!Number.isFinite(stock) || stock < 0) {
                    window.alert("Please enter a valid stock quantity.");
                    return;
                }

                if (!Number.isFinite(minStock) || minStock < 0) {
                    window.alert("Please enter a valid low stock warning level.");
                    return;
                }

                const products = getUserArray(KEYS.productsStore, uid);
                const image = imageFile ? await readImage(imageFile) : null;

                if (editingId) {

                    const index = products.findIndex(p => String(p.id) === String(editingId));

                    if (index !== -1) {
                        products[index] = {
                            ...products[index],
                            name, category, costPrice, price, stock, minStock,
                            image: image || products[index].image || null
                        };

                        setUserArray(KEYS.productsStore, uid, products);
                        logActivity("Product updated", name);
                        pushNotification("Product updated", `${name} was updated.`);

                        if (stock === 0) {
                            pushNotification("Out of stock", `"${name}" is out of stock.`);
                        } else if (stock <= minStock) {
                            pushNotification("Low stock warning", `"${name}" has only ${stock} left. You should purchase more soon.`);
                        }
                    } else {
                        window.alert("Could not find this product to update it. Please refresh the page and try again.");
                        return;
                    }

                } else {

                    const product = {
                        id: "prod-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
                        name, category, costPrice, price, stock, minStock,
                        image: image || null,
                        createdAt: new Date().toISOString()
                    };

                    products.push(product);
                    setUserArray(KEYS.productsStore, uid, products);
                    logActivity("Product added", name);
                    pushNotification("New product added", `${name} was added to your inventory.`);
                }

                clearForm();
                currentPage = 1;
                refreshAll();
            });
        }


        /* =================================================
           FILTERS
        ================================================= */

        const filterSearch = $("f-search");
        const filterCategory = $("f-category");
        const filterStatus = $("f-status");
        const filterClear = $("f-clear");
        const filterApply = $("f-apply");

        function applyFilters() {
            currentFilters = {
                search: filterSearch.value.trim().toLowerCase(),
                category: filterCategory.value,
                status: filterStatus.value
            };
            currentPage = 1;
            renderTable();
        }

        if (filterSearch) filterSearch.addEventListener("input", applyFilters);
        if (filterCategory) filterCategory.addEventListener("change", applyFilters);
        if (filterStatus) filterStatus.addEventListener("change", applyFilters);
        if (filterApply) filterApply.addEventListener("click", applyFilters);

        if (filterClear) {
            filterClear.addEventListener("click", function () {
                filterSearch.value = "";
                filterCategory.value = "";
                filterStatus.value = "";
                currentFilters = { search: "", category: "", status: "" };
                currentPage = 1;
                renderTable();
            });
        }


        /* =================================================
           REFRESH
        ================================================= */

        function refreshAll() {
            refreshSummary();
            renderTable();
            loadNotifications();
        }

        // Deep link support: product.html?status=Low+Stock (used by Reports > Low Stock Alert > View All)
        const presetStatus = new URLSearchParams(window.location.search).get("status");
        if (presetStatus && filterStatus) {
            const hasOption = Array.from(filterStatus.options).some(o => o.value === presetStatus || o.text === presetStatus);
            if (hasOption) {
                filterStatus.value = presetStatus;
                applyFilters();
            }
        }

        refreshAll();


        /* =================================================
           DEBUG
        ================================================= */

        window.AccountProProducts = {
            refresh: refreshAll,
            getProducts: () => getUserArray(KEYS.productsStore, uid),
            currentAccountId: uid,
            clearProducts: function () {
                setUserArray(KEYS.productsStore, uid, []);
                refreshAll();
            }
        };

        console.log("AccountPro Product Management ready. Account:", uid);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startProducts);
    } else {
        startProducts();
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