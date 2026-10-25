/* =========================================================
   ACCOUNT PRO
   EXPENSES.JS
   LOCAL STORAGE VERSION - PER ACCOUNT DATA
   ========================================================= */

(function () {
    "use strict";

    function startExpenses() {
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
            expensesStore: "accountProExpensesByUser",
            salesStore: "accountProSalesByUser",
            productsStore: "accountProProductsByUser",
            notificationsStore: "accountProNotificationsByUser",
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

        function getUserExpenses() {
            const store = getStore(KEYS.expensesStore);
            const arr = store[uid];
            return Array.isArray(arr) ? arr : [];
        }

        function setUserExpenses(expenses) {
            const store = getStore(KEYS.expensesStore);
            store[uid] = Array.isArray(expenses) ? expenses : [];
            saveStore(KEYS.expensesStore, store);
        }

        function getUserArray(storeKey, userId) {
            const arr = getStore(storeKey)[userId];
            return Array.isArray(arr) ? arr : [];
        }

        function setUserArray(storeKey, userId, value) {
            const store = getStore(storeKey);
            store[userId] = Array.isArray(value) ? value : [];
            saveStore(storeKey, store);
        }

        // --- بارگذاری نام و آواتار کاربر و نوتیفیکیشن‌ها ---
        const fullName = String(currentUser.fullName || currentUser.name || currentUser.username || "Admin User").trim();
        function loadUser() {
            const nameEl = $("navbar-user-name");
            const avatarEl =$("user-avatar");
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
                navUser.onclick = function (event) {
                    event.stopPropagation();
                    navUser.classList.toggle("show-tooltip");
                };
            }
        }
        loadUser();

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
                const date = n.date ? new Date(n.date) : null;
                return `
                    <div class="notification-item ${n.read ? "" : "unread"}" data-index="${index}">
                        <div class="notification-title">${escapeHTML(n.title || "Notification")}</div>
                        <div class="notification-message">${escapeHTML(n.message || "")}</div>
                        <div class="notification-date">${date && !isNaN(date) ? date.toLocaleString() : ""}</div>
                    </div>
                `;
            }).join("");
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
        loadNotifications();

        // تنظیم تاریخ و ساعت محلی به صورت اتوماتیک
        const dateInput = $("ex-date");
        if (dateInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dateInput.value = now.toISOString().slice(0, 16);
        }

        // محاسبه سود در دسترس امروز
        function getTodayAvailableProfit() {
            const salesStore = getStore(KEYS.salesStore);
            const productsStore = getStore(KEYS.productsStore);
            const userSales = salesStore[uid] || [];
            const userProducts = productsStore[uid] || [];

            const todayStr = new Date().toISOString().slice(0, 10);
            let todayRevenue = 0;
            let todayCOGS = 0;

            userSales.forEach(sale => {
                const saleDate = new Date(sale.date || sale.createdAt).toISOString().slice(0, 10);
                if (saleDate === todayStr) {
                    todayRevenue += Number(sale.total || sale.grandTotal || 0);
                    if (Array.isArray(sale.items)) {
                        sale.items.forEach(item => {
                            const prod = userProducts.find(p => p.id === item.productId || p.name === item.name);
                            const costPrice = prod ? Number(prod.costPrice || 0) : 0;
                            todayCOGS += costPrice * Number(item.quantity || 1);
                        });
                    }
                }
            });

            const grossProfit = todayRevenue - todayCOGS;

            const userExpenses = getUserExpenses();
            let todayBusinessExpenses = 0;
            userExpenses.forEach(ex => {
                const exDate = new Date(ex.date).toISOString().slice(0, 10);
                if (exDate === todayStr && ex.type === "Business" && ex.status === "Paid") {
                    todayBusinessExpenses += Number(ex.amount || 0);
                }
            });

            return Math.max(0, grossProfit - todayBusinessExpenses);
        }

        // فرم و وضعیت ویرایش
        let editingId = null;
        const form = $("expense-form");
        const submitBtn = $("ex-submit");
        const cancelBtn =$("ex-cancel");

        function fillForm(item) {
            $("ex-title").value = item.title || "";
            $("ex-category").value = item.category || "";
            $("ex-amount").value = item.amount ?? "";
            $("ex-type").value = item.type || "Business";
            $("ex-payment").value = item.paymentMethod || "Cash";
            $("ex-status").value = item.status || "Paid";
            $("ex-source").value = item.fundingSource || "Today's Profit";
            if (item.date) {
                const d = new Date(item.date);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                $("ex-date").value = d.toISOString().slice(0, 16);
            }
            $("ex-desc").value = item.description || "";
        }

        function clearForm() {
            if (form) form.reset();
            editingId = null;
            if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-plus"></i> <span>Save Expense</span>`;
            if (cancelBtn) cancelBtn.style.display = "none";
            
            if (dateInput) {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                dateInput.value = now.toISOString().slice(0, 16);
            }
        }

        if (cancelBtn) {
            cancelBtn.addEventListener("click", clearForm);
        }

        function startEdit(id) {
            const expenses = getUserExpenses();
            const item = expenses.find(ex => String(ex.id) === String(id));
            if (!item) return;

            editingId = id;
            fillForm(item);
            if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Update Expense</span>`;
            if (cancelBtn) cancelBtn.style.display = "inline-flex";
            document.querySelector(".add-panel").scrollIntoView({ behavior: "smooth", block: "start" });
        }

        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();

                const title = $("ex-title").value.trim();
                const category = $("ex-category").value;
                const amount = Number($("ex-amount").value);
                const type = $("ex-type").value;
                const paymentMethod = $("ex-payment").value;
                const status = $("ex-status").value;
                const fundingSource = $("ex-source").value;
                const date = $("ex-date").value;
                const description = $("ex-desc").value.trim();

                if (!title) { alert("Please enter an expense title."); return; }
                if (!category) { alert("Please select a category."); return; }
                if (!Number.isFinite(amount) || amount <= 0) { alert("Please enter a valid amount."); return; }

                if (!editingId && fundingSource === "Today's Profit" && status === "Paid") {
                    const availableProfit = getTodayAvailableProfit();
                    if (amount > availableProfit) {
                        const shortage = amount - availableProfit;
                        const confirmMsg = `Your expense is ${amount.toLocaleString()} AFN, but your available profit today is only ${availableProfit.toLocaleString()} AFN (Shortage: ${shortage.toLocaleString()} AFN). Do you want to proceed?`;
                        if (!window.confirm(confirmMsg)) {
                            return;
                        }
                    }
                }

                const expenses = getUserExpenses();

                if (editingId) {
                    const index = expenses.findIndex(ex => String(ex.id) === String(editingId));
                    if (index !== -1) {
                        expenses[index] = {
                            ...expenses[index],
                            title,
                            category,
                            amount,
                            type,
                            paymentMethod,
                            status,
                            fundingSource,
                            date: date || expenses[index].date,
                            description,
                            updatedAt: new Date().toISOString()
                        };
                        setUserExpenses(expenses);
                        alert("Expense successfully updated.");
                    }
                } else {
                    const newExpense = {
                        id: "exp-" + Date.now(),
                        title,
                        category,
                        amount,
                        type,
                        paymentMethod,
                        status,
                        fundingSource,
                        date: date || new Date().toISOString(),
                        description,
                        createdAt: new Date().toISOString()
                    };
                    expenses.unshift(newExpense);
                    setUserExpenses(expenses);
                    alert("Expense successfully recorded.");
                }

                clearForm();
                renderExpenses();
            });
        }

        function renderExpenses() {
            const body = $("expense-body");
            if (!body) return;

            const expenses = getUserExpenses();

            if (expenses.length === 0) {
                body.innerHTML = `<tr><td colspan="10"><div class="empty-state">No expenses recorded yet.</div></td></tr>`;
                return;
            }

            body.innerHTML = expenses.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${escapeHTML(item.title)}</strong></td>
                    <td><span class="cat-badge">${escapeHTML(item.category)}</span></td>
                    <td><span class="badge-type">${escapeHTML(item.type)}</span></td>
                    <td><strong>${Number(item.amount).toLocaleString()}</strong></td>
                    <td>${escapeHTML(item.paymentMethod)}</td>
                    <td>${escapeHTML(item.fundingSource)}</td>
                    <td><span class="status ${item.status === 'Paid' ? 'instock' : 'outstock'}">${escapeHTML(item.status)}</span></td>
                    <td>${escapeHTML(new Date(item.date).toLocaleString())}</td>
                    <td>
                        <button class="act-btn edit" data-id="${item.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="act-btn del" data-id="${item.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join("");

            body.querySelectorAll(".act-btn.edit").forEach(btn => {
                btn.addEventListener("click", () => startEdit(btn.dataset.id));
            });

            body.querySelectorAll(".act-btn.del").forEach(btn => {
                btn.addEventListener("click", function () {
                    const id = btn.dataset.id;
                    if (window.confirm("Are you sure you want to delete this expense?")) {
                        const updated = getUserExpenses().filter(ex => ex.id !== id);
                        setUserExpenses(updated);
                        renderExpenses();
                        if (String(editingId) === String(id)) clearForm();
                    }
                });
            });
        }

        function escapeHTML(str) {
            return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        renderExpenses();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startExpenses);
    } else {
        startExpenses();
    }
})();

/* =========================================================
   MOBILE SIDEBAR TOGGLE & OVERLAY (مخصوص صفحه مصارف)
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const mobileBtn = document.getElementById("mobile-menu");

    if (!sidebar || !mobileBtn) return;

    // بررسی و ساخت لایه تاریک پشت سایدبار در موبایل
    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
    }

    // باز و بسته کردن منو با کلیک روی دکمه همبرگری (سه خط)
    mobileBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });

    // بستن کامل منو با کلیک روی بخش تاریک بیرون از سایدبار
    overlay.addEventListener("click", function () {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });
});