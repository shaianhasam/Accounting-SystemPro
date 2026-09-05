// // 1. بررسی وضعیت ورود در بدو ورود به داشبورد
   


// (function guardDashboard() {
//     const isLoggedIn = localStorage.getItem("accountProLoggedIn");
//     if (isLoggedIn !== "true") {
//         window.location.href = "login.html"; // نام فایل صفحه ورود شما
//     }
// })();


// document.addEventListener("DOMContentLoaded", () => {
  
//   // 1. AUTHENTICATION & REDIRECT CHECK
//   const isLoggedIn = localStorage.getItem("accountProLoggedIn");
//   if (isLoggedIn !== "true") {
//     window.location.href = "index.html"; // اگر لاگین نکرده بود هدایت شود
//     return;
//   }

//   // 2. DYNAMIC USER PROFILE
//   const activeUser = JSON.parse(localStorage.getItem("accountProActiveUser")) || {
//     fullName: "Rina Mahendra",
//     businessName: "Finance Admin"
//   };

//   const nameParts = activeUser.fullName.trim().split(" ");
//   let initials = nameParts[0].charAt(0).toUpperCase();
//   if (nameParts.length > 1) {
//     initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
//   }

//   document.getElementById("user-avatar-circle").innerText = initials;
//   document.getElementById("user-name").innerText = activeUser.fullName;
//   document.getElementById("user-role").innerText = activeUser.businessName || "Administrator";

//   // 3. DYNAMIC GREETING
//   const hour = new Date().getHours();
//   let greetingTime = "Good day";
//   if (hour >= 5 && hour < 12) greetingTime = "Good morning";
//   else if (hour >= 12 && hour < 17) greetingTime = "Good afternoon";
//   else if (hour >= 17 && hour < 22) greetingTime = "Good evening";
//   else greetingTime = "Good night";

//   document.getElementById("dynamic-greeting").innerText = `${greetingTime}, ${nameParts[0]}`;

//   // 4. LOAD DASHBOARD STATISTICS
//   function renderDashboardData() {
//     const summary = DashboardAPI.getSummary();

//     document.getElementById("stat-today-sales").innerText = `$${summary.todaySales.toFixed(2)}`;
//     document.getElementById("stat-today-profit").innerText = `$${summary.todayProfit.toFixed(2)}`;
//     document.getElementById("stat-weekly-sales").innerText = `$${summary.weeklySales.toFixed(2)}`;
//     document.getElementById("stat-weekly-profit").innerText = `$${summary.weeklyProfit.toFixed(2)}`;
//     document.getElementById("stat-monthly-sales").innerText = `$${summary.monthlySales.toFixed(2)}`;
//     document.getElementById("stat-monthly-profit").innerText = `$${summary.monthlyProfit.toFixed(2)}`;

//     document.getElementById("summary-total-sales").innerText = `$${summary.totalSalesAllTime.toFixed(2)}`;
//     document.getElementById("summary-total-orders").innerText = summary.totalOrders;
//     document.getElementById("summary-avg-order").innerText = `$${summary.avgOrderValue}`;
//     document.getElementById("summary-active-products").innerText = summary.activeProducts;

//     // Render Low Stock Alert
//     const lowStockItems = DashboardAPI.getLowStock();
//     const lowStockContainer = document.getElementById("low-stock-list");
//     lowStockContainer.innerHTML = lowStockItems.length ? "" : "<p class='sub-text'>No low stock items.</p>";
    
//     lowStockItems.forEach(item => {
//       lowStockContainer.innerHTML += `
//         <div class="list-item">
//           <div class="item-info">
//             <i class="fa-solid fa-box" style="color: #f59e0b;"></i>
//             <span>${item.name}</span>
//           </div>
//           <span class="status-pill ${item.stock === 0 ? 'out' : 'low'}">
//             ${item.stock === 0 ? 'Out of Stock' : 'Stock: ' + item.stock}
//           </span>
//         </div>
//       `;
//     });

    

//     // Render Recent Sales Table
//     const recentSales = DashboardAPI.getRecentSales();
//     const tbody = document.getElementById("recent-sales-tbody");
//     tbody.innerHTML = "";
//     recentSales.forEach(s => {
//       tbody.innerHTML += `
//         <tr>
//           <td><strong>${s.invoice}</strong></td>
//           <td>${s.customer}</td>
//           <td>${s.product}</td>
//           <td>${s.qty}</td>
//           <td>$${s.total.toFixed(2)}</td>
//           <td style="color:#16a34a;">+$${s.profit.toFixed(2)}</td>
//           <td>${new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
//           <td><span class="status-pill" style="background:#dcfce7;color:#16a34a;">${s.status}</span></td>
//         </tr>
//       `;
//     });

//     // Render Recent Activities
//     const activities = DashboardAPI.getActivities();
//     const actContainer = document.getElementById("recent-activity-list");
//     actContainer.innerHTML = "";
//     activities.forEach(a => {
//       actContainer.innerHTML += `
//         <div class="activity-item">
//           <i class="fa-solid fa-circle-dot activity-icon"></i>
//           <div>
//             <div>${a.action}</div>
//             <div class="activity-time">${a.time}</div>
//           </div>
//         </div>
//       `;
//     });
//   }

//   renderDashboardData();

//   // 5. CHARTS INITIALIZATION (Chart.js)
//   const ctxSales = document.getElementById('salesChart').getContext('2d');
//   new Chart(ctxSales, {
//     type: 'line',
//     data: {
//       labels: ['May 16', 'May 17', 'May 18', 'May 19', 'May 20', 'May 21', 'May 22'],
//       datasets: [{
//         label: 'Sales ($)',
//         data: [3650, 4280, 2980, 4760, 6420, 3940, 2910],
//         borderColor: '#2563eb',
//         backgroundColor: 'rgba(37, 99, 235, 0.1)',
//         fill: true,
//         tension: 0.4
//       }]
//     },
//     options: { responsive: true, maintainAspectRatio: false }
//   });

//   const ctxProfit = document.getElementById('profitChart').getContext('2d');
//   new Chart(ctxProfit, {
//     type: 'line',
//     data: {
//       labels: ['May 16', 'May 17', 'May 18', 'May 19', 'May 20', 'May 21', 'May 22'],
//       datasets: [{
//         label: 'Profit ($)',
//         data: [1250, 1520, 820, 1650, 2350, 1310, 960],
//         borderColor: '#16a34a',
//         backgroundColor: 'rgba(22, 163, 74, 0.1)',
//         fill: true,
//         tension: 0.4
//       }]
//     },
//     options: { responsive: true, maintainAspectRatio: false }
//   });

//   // 6. NOTIFICATIONS DROPDOWN
//   const notifBtn = document.getElementById("notif-btn");
//   const notifDropdown = document.getElementById("notif-dropdown");
//   const notifBadge = document.getElementById("notif-badge");

//   function updateNotifications() {
//     const notifs = DashboardAPI.getNotifications();
//     const unreadCount = notifs.filter(n => !n.read).length;
//     notifBadge.innerText = unreadCount;
//     notifBadge.style.display = unreadCount ? "block" : "none";

//     const list = document.getElementById("notif-list");
//     list.innerHTML = notifs.map(n => `
//       <div class="notif-item ${n.read ? '' : 'unread'}">
//         <strong>${n.title}</strong>
//         <p>${n.message}</p>
//         <span class="sub-text">${n.time}</span>
//       </div>
//     `).join("");
//   }

//   notifBtn.addEventListener("click", () => {
//     notifDropdown.style.display = notifDropdown.style.display === "block" ? "none" : "block";
//   });

//   document.getElementById("mark-all-read").addEventListener("click", () => {
//     DashboardAPI.markNotifsRead();
//     updateNotifications();
//   });

//   updateNotifications();

//   // 7. SEARCH FUNCTIONALITY
//   const searchInput = document.getElementById("global-search");
//   const searchDropdown = document.getElementById("search-dropdown");

//   searchInput.addEventListener("input", (e) => {
//     const results = DashboardAPI.searchAll(e.target.value.trim());
//     if (results.length) {
//       searchDropdown.innerHTML = results.map(r => `
//         <div class="search-item">
//           <strong>[${r.type}]</strong> ${r.text}
//         </div>
//       `).join("");
//       searchDropdown.style.display = "block";
//     } else {
//       searchDropdown.style.display = "none";
//     }
//   });

//   // 8. DARK MODE TOGGLE
//   const themeBtn = document.getElementById("theme-toggle");
//   themeBtn.addEventListener("click", () => {
//     document.body.classList.toggle("dark-theme");
//     const isDark = document.body.classList.contains("dark-theme");
//     localStorage.setItem("accountProTheme", isDark ? "dark" : "light");
//   });

//   if (localStorage.getItem("accountProTheme") === "dark") {
//     document.body.classList.add("dark-theme");
//   }

//   // 9. EXPORT REPORT BUTTON
//   document.getElementById("export-report-btn").addEventListener("click", () => {
//     const summary = DashboardAPI.getSummary();
//     const reportStr = `ACCOUNTPRO DASHBOARD SUMMARY REPORT\nDate: ${new Date().toLocaleDateString()}\n\nToday's Sales: $${summary.todaySales}\nToday's Profit: $${summary.todayProfit}\nTotal Sales (All Time): $${summary.totalSalesAllTime}\nTotal Orders: ${summary.totalOrders}`;
    
//     const blob = new Blob([reportStr], { type: "text/plain" });
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.download = `Dashboard_Report_${Date.now()}.txt`;
//     a.click();
//   });

//   // 10. LOGOUT
//   document.getElementById("logout-btn").addEventListener("click", () => {
//     localStorage.removeItem("accountProLoggedIn");
//     window.location.href = "index.html";
//   });

//   // 11. NEW SALE PLACEHOLDER
//   document.getElementById("new-sale-btn").addEventListener("click", () => {
//     alert("New Sale module will be connected in the next step!");
//   });
// });