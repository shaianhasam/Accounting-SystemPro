// // ==========================================
// // MOCK DATABASE & API SERVICE FOR DASHBOARD
// // ==========================================

// const DB_KEYS = {
//   PRODUCTS: "accountpro_products",
//   SALES: "accountpro_sales",
//   NOTIFS: "accountpro_notifications",
//   ACTIVITIES: "accountpro_activities"
// };

// // Initialize Default Seed Data if DB is empty
// (function initDB() {
//   if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
//     const defaultProducts = [
//       { id: 1, name: "Chocolate Biscuits", category: "Snacks", costPrice: 1.20, sellingPrice: 1.80, stock: 45, lowStockLimit: 10 },
//       { id: 2, name: "Coca Cola 1.5L", category: "Beverages", costPrice: 0.80, sellingPrice: 1.20, stock: 25, lowStockLimit: 8 },
//       { id: 3, name: "Lays Classic Chips", category: "Snacks", costPrice: 0.90, sellingPrice: 1.50, stock: 4, lowStockLimit: 10 },
//       { id: 4, name: "Basmati Rice 5kg", category: "Grains", costPrice: 6.50, sellingPrice: 8.90, stock: 3, lowStockLimit: 5 },
//       { id: 5, name: "Lux Soap", category: "Personal Care", costPrice: 0.40, sellingPrice: 0.70, stock: 0, lowStockLimit: 5 }
//     ];
//     localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
//   }

//   if (!localStorage.getItem(DB_KEYS.SALES)) {
//     const defaultSales = [
//       { invoice: "INV-1005", customer: "Walk-in Customer", product: "Chocolate Biscuits", qty: 3, total: 5.40, profit: 1.80, date: new Date().toISOString(), status: "Completed" },
//       { invoice: "INV-1004", customer: "Walk-in Customer", product: "Coca Cola 1.5L", qty: 2, total: 2.40, profit: 0.80, date: new Date().toISOString(), status: "Completed" },
//       { invoice: "INV-1003", customer: "John Doe", product: "Basmati Rice 5kg", qty: 1, total: 8.90, profit: 2.40, date: new Date(Date.now() - 86400000).toISOString(), status: "Completed" }
//     ];
//     localStorage.setItem(DB_KEYS.SALES, JSON.stringify(defaultSales));
//   }

//   if (!localStorage.getItem(DB_KEYS.NOTIFS)) {
//     const defaultNotifs = [
//       { id: 1, title: "Low Stock Alert", message: "Basmati Rice 5kg is critically low (3 left).", read: false, time: "10 mins ago" },
//       { id: 2, title: "New Sale Created", message: "Invoice INV-1005 processed successfully.", read: false, time: "1 hour ago" }
//     ];
//     localStorage.setItem(DB_KEYS.NOTIFS, JSON.stringify(defaultNotifs));
//   }

//   if (!localStorage.getItem(DB_KEYS.ACTIVITIES)) {
//     const defaultActivities = [
//       { id: 1, action: "Sale INV-1005 created for $5.40", time: "Just now" },
//       { id: 2, action: "Stock updated for Basmati Rice 5kg", time: "2 hours ago" },
//       { id: 3, action: "User logged into system", time: "Today" }
//     ];
//     localStorage.setItem(DB_KEYS.ACTIVITIES, JSON.stringify(defaultActivities));
//   }
// })();

// // BACKEND API SERVICES
// const DashboardAPI = {
//   getProducts: () => JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS)) || [],
//   getSales: () => JSON.parse(localStorage.getItem(DB_KEYS.SALES)) || [],
  
//   // GET /api/dashboard/summary
//   getSummary: function() {
//     const sales = this.getSales();
//     const products = this.getProducts();
//     const todayStr = new Date().toISOString().split('T')[0];

//     let todaySales = 0, todayProfit = 0;
//     let totalSales = 0, totalProfit = 0;

//     sales.forEach(s => {
//       totalSales += s.total;
//       totalProfit += s.profit;
//       if (s.date.startsWith(todayStr)) {
//         todaySales += s.total;
//         todayProfit += s.profit;
//       }
//     });

//     const activeProductsCount = products.filter(p => p.stock > 0).length;

//     return {
//       todaySales,
//       todayProfit,
//       weeklySales: totalSales * 0.4, // Calculated from sales
//       weeklyProfit: totalProfit * 0.4,
//       monthlySales: totalSales,
//       monthlyProfit: totalProfit,
//       totalSalesAllTime: totalSales,
//       totalOrders: sales.length,
//       avgOrderValue: sales.length ? (totalSales / sales.length).toFixed(2) : 0,
//       activeProducts: activeProductsCount
//     };
//   },

//   // GET /api/dashboard/low-stock
//   getLowStock: function() {
//     const products = this.getProducts();
//     return products.filter(p => p.stock <= p.lowStockLimit);
//   },

//   // GET /api/dashboard/best-selling
//   getBestSelling: function() {
//     const products = this.getProducts();
//     return products.sort((a, b) => a.stock - b.stock).slice(0, 5);
//   },

//   // GET /api/dashboard/recent-sales
//   getRecentSales: function() {
//     return this.getSales().slice(0, 5);
//   },

//   // GET /api/notifications
//   getNotifications: function() {
//     return JSON.parse(localStorage.getItem(DB_KEYS.NOTIFS)) || [];
//   },

//   // PATCH /api/notifications/read
//   markNotifsRead: function() {
//     const notifs = this.getNotifications().map(n => ({ ...n, read: true }));
//     localStorage.setItem(DB_KEYS.NOTIFS, JSON.stringify(notifs));
//     return notifs;
//   },

//   // GET /api/dashboard/activity
//   getActivities: function() {
//     return JSON.parse(localStorage.getItem(DB_KEYS.ACTIVITIES)) || [];
//   },

//   // GET /api/search
//   searchAll: function(query) {
//     if (!query) return [];
//     const q = query.toLowerCase();
//     const products = this.getProducts().filter(p => p.name.toLowerCase().includes(q));
//     const sales = this.getSales().filter(s => s.invoice.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q));
    
//     return [
//       ...products.map(p => ({ type: 'Product', text: `${p.name} - Stock: ${p.stock}` })),
//       ...sales.map(s => ({ type: 'Invoice', text: `${s.invoice} - ${s.customer} ($${s.total})` }))
//     ];
//   }
// };