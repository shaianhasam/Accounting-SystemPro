/* =========================================================
   ACCOUNT PRO
   LANG.JS  -  English / Persian (Dari) support

   Load this file in the <head> of every page, BEFORE the
   page's own script. It:
     1. remembers the chosen language ("accountProLang")
     2. sets <html lang dir> (rtl for Persian) immediately
     3. adds a language button next to the notification bell
     4. when Persian is active, translates every visible text,
        placeholder, tooltip, alert/confirm/prompt and also any
        text the pages render later (tables, notifications...)

   Data is never translated or changed - only what is shown.
   Select values (categories, statuses, payment methods) stay
   English inside the app so filters and reports keep working.
   ========================================================= */

(function () {
    "use strict";

    var KEY = "accountProLang";

    var LANG = "en";
    try {
        LANG = localStorage.getItem(KEY) === "fa" ? "fa" : "en";
    } catch (e) { /* storage blocked - stay English */ }

    var root = document.documentElement;
    root.setAttribute("lang", LANG);
    root.setAttribute("dir", LANG === "fa" ? "rtl" : "ltr");

    window.AccountProLang = { lang: LANG };


    /* =====================================================
       DICTIONARY  (exact English text  ->  Persian)
    ===================================================== */

    var DICT = {

        /* ---- brand / navigation ---- */
        "Accounting System": "سیستم حسابداری",
        "Dashboard": "داشبورد",
        "Product Management": "مدیریت محصولات",
        "Sales History": "تاریخچه فروشات",
        "Reports": "گزارش‌ها",
        "Settings": "تنظیمات",
        "Dark mode": "حالت تاریک",
        "Toggle dark mode": "تغییر حالت تاریک",
        "Logout": "خروج",
        "Language": "زبان",
        "Finance Admin": "مدیر مالی",
        "User": "کاربر",
        "Notifications": "اعلان‌ها",
        "Notification": "اعلان",
        "Activity": "فعالیت",
        "Mark all read": "خوانده شدن همه",
        "No notifications": "اعلانی وجود ندارد",
        "No results found": "نتیجه‌ای یافت نشد",
        "Search invoices, products, customers...": "جستجوی فاکتورها، محصولات و مشتریان...",
        "Sale": "فروش",

        /* ---- shared words ---- */
        "Action": "عملیات",
        "Actions": "عملیات",
        "Apply": "اعمال",
        "Cancel": "لغو",
        "Close": "بستن",
        "Filter": "فیلتر",
        "Clear Filters": "پاک کردن فیلترها",
        "View all": "مشاهده همه",
        "View All": "مشاهده همه",
        "Date": "تاریخ",
        "Date:": "تاریخ:",
        "Time": "زمان",
        "Time:": "زمان:",
        "Status": "وضعیت",
        "Customer": "مشتری",
        "Customer:": "مشتری:",
        "Product": "محصول",
        "Category": "دسته‌بندی",
        "Image": "تصویر",
        "Items": "اقلام",
        "Qty": "تعداد",
        "Price": "قیمت",
        "Total": "مجموع",
        "TOTAL:": "مجموع:",
        "Profit": "سود",
        "Orders": "سفارش‌ها",
        "Stock": "موجودی",
        "Payment": "پرداخت",
        "Payment:": "پرداخت:",
        "Daily": "روزانه",
        "Weekly": "هفتگی",
        "Monthly": "ماهانه",
        "From": "از",
        "To": "تا",
        "New": "جدید",
        "Edit": "ویرایش",
        "Delete": "حذف",
        "Remove": "حذف",
        "View": "مشاهده",
        "Print": "چاپ",
        "View / Print": "مشاهده / چاپ",
        "Unknown product": "محصول نامشخص",
        "Walk-in Customer": "مشتری عادی",
        "Completed": "تکمیل‌شده",
        "Pending": "در انتظار",
        "Cancelled": "لغو شده",
        "and": "و",

        /* ---- categories / statuses / payments ---- */
        "Beverages": "نوشیدنی‌ها",
        "Food": "مواد غذایی",
        "Snacks": "تنقلات",
        "Dairy": "لبنیات",
        "Grains": "غلات",
        "Household": "لوازم خانه",
        "Personal Care": "مراقبت شخصی",
        "Other": "سایر",
        "In Stock": "موجود",
        "Low Stock": "موجودی کم",
        "Out of Stock": "ختم شده",
        "Out of stock": "ختم شده",
        "Low": "کم",
        "Cash": "نقدی",
        "Card": "کارت",
        "Mobile Money": "پول موبایل",

        /* ---- dashboard ---- */
        "Here's how the business is performing today.": "وضعیت امروز تجارت شما این است.",
        "Export report": "خروجی گزارش",
        "Export Report": "خروجی گزارش",
        "New sale": "فروش جدید",
        "New Sale": "فروش جدید",
        "Today's Sales": "فروش امروز",
        "Today's Profit": "سود امروز",
        "Weekly Sales": "فروش هفتگی",
        "Weekly Profit": "سود هفتگی",
        "Monthly Sales": "فروش ماهانه",
        "Monthly Profit": "سود ماهانه",
        "Total Sales (All-time)": "مجموع فروش (از ابتدا)",
        "Avg. order value": "میانگین ارزش سفارش",
        "Active products": "محصولات فعال",
        "Sales Performance": "عملکرد فروش",
        "Daily revenue, last 14 days": "عواید روزانه، 14 روز اخیر",
        "Last 14 days": "14 روز اخیر",
        "Profit Trend": "روند سود",
        "Daily profit, last 14 days": "سود روزانه، 14 روز اخیر",
        "Low Stock Alert": "هشدار کمبود موجودی",
        "Products that need restocking soon": "محصولاتی که به‌زودی باید دوباره تهیه شوند",
        "Best-Selling Products": "پرفروش‌ترین محصولات",
        "By units sold this month": "بر اساس تعداد فروش در این ماه",
        "Recent Sales": "فروشات اخیر",
        "Latest transactions across all channels": "آخرین معاملات از همه کانال‌ها",
        "Recent Activity": "فعالیت‌های اخیر",
        "System events": "رویدادهای سیستم",
        "Invoice": "فاکتور",
        "No low-stock products.": "محصولی با موجودی کم وجود ندارد.",
        "No sales data yet.": "هنوز اطلاعات فروش وجود ندارد.",
        "No sales yet.": "هنوز فروشی وجود ندارد.",
        "No recent activity.": "فعالیتی وجود ندارد.",
        "No sales data available yet.": "هنوز اطلاعات فروش وجود ندارد.",
        "No sales data in this period.": "در این بازه اطلاعات فروش وجود ندارد.",
        "No sales in this period.": "در این بازه فروشی وجود ندارد.",
        "No sales found.": "فروشی پیدا نشد.",
        "Total Sales": "مجموع فروش",
        "Total Profit": "مجموع سود",

        /* ---- product management ---- */
        "Add, edit and manage your store products": "محصولات دوکان خود را اضافه، ویرایش و مدیریت کنید",
        "Total Products": "مجموع محصولات",
        "Low Stock Items": "اجناس با موجودی کم",
        "Available Items": "اجناس موجود",
        "Add New Product": "افزودن محصول جدید",
        "Add Product": "افزودن محصول",
        "Update Product": "به‌روزرسانی محصول",
        "Product Name": "نام محصول",
        "Enter product name": "نام محصول را وارد کنید",
        "Select category": "انتخاب دسته‌بندی",
        "Purchase Price": "قیمت خرید",
        "Selling Price": "قیمت فروش",
        "Stock Quantity": "مقدار موجودی",
        "Enter quantity": "مقدار موجودی را وارد کنید",
        "Low Stock Warning": "حد هشدار کمبود موجودی",
        "Enter low stock limit": "حد هشدار را وارد کنید",
        "Product Image (Optional)": "تصویر محصول (اختیاری)",
        "Search products...": "جستجوی محصولات...",
        "All Categories": "همه دسته‌ها",
        "All Status": "همه وضعیت‌ها",
        "All Products": "همه محصولات",
        "Every product saved in your store": "تمام محصولات ثبت‌شده در دوکان شما",
        "Add stock": "افزودن موجودی",
        "No products found. Add your first product above.": "محصولی پیدا نشد. اولین محصول خود را در بالا اضافه کنید.",
        "Change currency": "تغییر واحد پول",
        "Which currency do you sell in?": "فروش شما به کدام واحد پول است؟",
        "This applies to your whole shop: products, sales, invoices and reports. Existing amounts are not converted - only the symbol changes.":
            "این انتخاب برای کل دوکان شما اعمال می‌شود: محصولات، فروشات، فاکتورها و گزارش‌ها. مبلغ‌های موجود تبدیل نمی‌شوند، فقط علامت تغییر می‌کند.",
        "Dollar (USD)": "دالر (USD)",
        "Afghani (AFN)": "افغانی (AFN)",

        /* ---- sales / POS ---- */
        "Sales / Create New Sale": "فروشات / ایجاد فروش جدید",
        "Select products and complete the sale": "محصولات را انتخاب کنید و فروش را تکمیل کنید",
        "Select Products": "انتخاب محصولات",
        "Search products by name or barcode...": "جستجوی محصول با نام یا بارکد...",
        "Sort": "مرتب‌سازی",
        "Price: Low to High": "قیمت: کم به زیاد",
        "Price: High to Low": "قیمت: زیاد به کم",
        "Name: A to Z": "نام: الف تا ی",
        "Grid view": "نمای شبکه‌ای",
        "List view": "نمای فهرستی",
        "Latest completed transactions": "آخرین معاملات تکمیل‌شده",
        "Invoice #": "شماره فاکتور",
        "View All Sales History": "مشاهده تمام تاریخچه فروشات",
        "Clear Cart": "خالی کردن سبد",
        "Cart is empty. Select a product to get started.": "سبد خالی است. برای شروع یک محصول انتخاب کنید.",
        "No products found. Add products from Product Management first.": "محصولی پیدا نشد. ابتدا از مدیریت محصولات محصول اضافه کنید.",
        "Subtotal": "مجموع جزئی",
        "Subtotal:": "مجموع جزئی:",
        "Discount": "تخفیف",
        "Discount:": "تخفیف:",
        "Tax": "مالیات",
        "Tax:": "مالیات:",
        "Payment Method": "روش پرداخت",
        "Received Amount": "مبلغ دریافتی",
        "Received": "دریافتی",
        "Received:": "دریافتی:",
        "Change": "باقی‌مانده",
        "Change:": "باقی‌مانده:",
        "Complete Sale": "تکمیل فروش",

        /* ---- sales history ---- */
        "Every completed sale for your account": "تمام فروشات تکمیل‌شده حساب شما",
        "Transactions": "معاملات",
        "Search invoice or customer...": "جستجوی فاکتور یا مشتری...",
        "All Payment Methods": "همه روش‌های پرداخت",
        "All Sales": "همه فروشات",
        "Date / Time": "تاریخ / زمان",
        "Sale Details": "جزئیات فروش",
        "Print Invoice": "چاپ فاکتور",

        /* ---- invoice (print) ---- */
        "Invoice No:": "شماره فاکتور:",
        "Thank you for your purchase!": "از خرید شما سپاسگزاریم!",

        /* ---- reports ---- */
        "View detailed insights and performance reports": "گزارش‌های دقیق و عملکرد کسب‌وکار را مشاهده کنید",
        "Last 7 days": "7 روز اخیر",
        "Last 30 days": "30 روز اخیر",
        "This month": "این ماه",
        "Avg Order Value": "میانگین ارزش سفارش",
        "Total Orders": "مجموع سفارش‌ها",
        "Total Expenses": "مجموع مصارف",
        "Expenses": "مصارف",
        "Net Profit": "سود خالص",
        "Total Customers": "مجموع مشتریان",
        "Not tracked yet": "هنوز ثبت نمی‌شود",
        "vs previous period": "نسبت به دوره قبل",
        "Sales Overview": "مرور فروش",
        "Profit Overview": "مرور سود",
        "Summary": "خلاصه",
        "View Full Summary": "مشاهده خلاصه کامل",
        "Top Selling Products": "پرفروش‌ترین محصولات",
        "Sales Report": "گزارش فروش",

        /* ---- login / sign up ---- */
        "AccountPro - Login & Sign Up": "AccountPro - ورود و ثبت‌نام",
        "Welcome Back!": "خوش آمدید!",
        "Sign in to continue your account": "برای ادامه وارد حساب خود شوید",
        "Email Address": "آدرس ایمیل",
        "Enter your email": "ایمیل خود را وارد کنید",
        "Password": "رمز عبور",
        "Enter your password": "رمز عبور خود را وارد کنید",
        "Remember me": "مرا به خاطر بسپار",
        "Forgot Password?": "رمز عبور را فراموش کرده‌اید؟",
        "Sign In": "ورود",
        "Sign Up": "ثبت‌نام",
        "Or continue with": "یا ادامه با",
        "Don't have an account?": "حساب کاربری ندارید؟",
        "Already have an account?": "حساب کاربری دارید؟",
        "Create Your Account": "حساب کاربری خود را بسازید",
        "Sign up to start managing your business finances": "برای مدیریت امور مالی تجارت خود ثبت‌نام کنید",
        "Full Name": "نام کامل",
        "Enter your Name": "نام خود را وارد کنید",
        "Business Name": "نام تجارت",
        "Must be at least 8 characters": "حداقل 8 حرف باشد",
        "Terms of Service": "شرایط خدمات",
        "Privacy Policy": "سیاست حریم خصوصی",
        "Run your business": "تجارت خود را",
        "with confidence": "با اطمینان اداره کنید",
        "Track sales, manage inventory, and see your profit update in real time.":
            "فروشات را دنبال کنید، موجودی را مدیریت کنید و سود خود را به‌صورت زنده ببینید.",

        /* ---- alerts / confirms / prompts ---- */
        "Are you sure you want to logout?": "آیا مطمئن هستید که می‌خواهید خارج شوید؟",
        "Clear all items from the current sale?": "همه اقلام فروش جاری حذف شود؟",
        "It will be connected to the Local Storage modules first, then to Backend.":
            "ابتدا به ماژول‌های ذخیره‌سازی محلی و سپس به سرور وصل خواهد شد.",
        "An account with this email already exists.": "حسابی با این ایمیل از قبل وجود دارد.",
        "Incorrect email or password. Please try again.": "ایمیل یا رمز عبور اشتباه است. دوباره تلاش کنید.",
        "No account found. Please create an account first.": "حسابی پیدا نشد. ابتدا یک حساب بسازید.",
        "Password must be at least 8 characters.": "رمز عبور باید حداقل 8 حرف باشد.",
        "Please fill in all fields.": "لطفاً همه فیلدها را پر کنید.",
        "Please choose both a start and an end date.": "لطفاً تاریخ شروع و پایان را انتخاب کنید.",
        "The start date must be before the end date.": "تاریخ شروع باید قبل از تاریخ پایان باشد.",
        "There are no sales in this period to export.": "در این بازه فروشی برای خروجی گرفتن وجود ندارد.",
        "There are no sales to export.": "فروشی برای خروجی گرفتن وجود ندارد.",
        "Please enter a product name.": "لطفاً نام محصول را وارد کنید.",
        "Please select a category.": "لطفاً دسته‌بندی را انتخاب کنید.",
        "Please enter a valid purchase price.": "لطفاً قیمت خرید معتبر وارد کنید.",
        "Please enter a valid selling price.": "لطفاً قیمت فروش معتبر وارد کنید.",
        "Please enter a valid stock quantity.": "لطفاً مقدار موجودی معتبر وارد کنید.",
        "Please enter a valid low stock warning level.": "لطفاً حد هشدار معتبر وارد کنید.",
        "Please enter a valid positive quantity.": "لطفاً یک مقدار مثبت معتبر وارد کنید.",
        "The cart is empty. Add at least one product.": "سبد خالی است. حداقل یک محصول اضافه کنید.",
        "Could not find this product to update it. Please refresh the page and try again.":
            "این محصول برای به‌روزرسانی پیدا نشد. صفحه را تازه کنید و دوباره تلاش کنید.",
        "Could not find this product. Please refresh the page and try again.":
            "این محصول پیدا نشد. صفحه را تازه کنید و دوباره تلاش کنید.",

        /* ---- notification / activity titles ---- */
        "Currency changed": "واحد پول تغییر کرد",
        "Now selling in Afghani": "اکنون فروش به افغانی است",
        "Now selling in Dollar": "اکنون فروش به دالر است",
        "Low stock warning": "هشدار کمبود موجودی",
        "New product added": "محصول جدید اضافه شد",
        "Product added": "محصول اضافه شد",
        "Product deleted": "محصول حذف شد",
        "Product removed": "محصول حذف شد",
        "Product updated": "محصول به‌روزرسانی شد",
        "Sale completed": "فروش تکمیل شد",
        "Stock added": "موجودی افزوده شد",
        "Stock updated": "موجودی به‌روزرسانی شد"
    };


    /* HTML snippets for sentences whose word order differs */
    var HTML_DICT = {
        terms: 'با <a href="#">شرایط خدمات</a> و <a href="#">سیاست حریم خصوصی</a> موافقم'
    };


    /* =====================================================
       PATTERN RULES  (sentences that contain names/numbers)
    ===================================================== */

    function tr(text) { return translateCore(String(text)); }

    var GREETINGS = {
        morning: "صبح بخیر",
        afternoon: "روز بخیر",
        evening: "عصر بخیر",
        night: "شب بخیر"
    };

    var RULES = [
        [/^AccountPro - (.+)$/, function (m) { return "AccountPro - " + tr(m[1]); }],
        [/^Good (morning|afternoon|evening|night), (.+)$/, function (m) { return GREETINGS[m[1]] + "، " + m[2]; }],
        [/^Current Sale \((\d+)\)$/, function (m) { return "فروش جاری (" + m[1] + ")"; }],
        [/^Tax \(([\d.]+)%\)$/, function (m) { return "مالیات (" + m[1] + "%)"; }],
        [/^(\d+) items?$/, function (m) { return m[1] + " قلم"; }],
        [/^Stock: (.+)$/, function (m) { return "موجودی: " + m[1]; }],
        [/^(\d+) left$/, function (m) { return m[1] + " باقی"; }],
        [/^Minimum: (\d+)$/, function (m) { return "حداقل: " + m[1]; }],
        [/^(.+) units · (.+)$/, function (m) { return m[1] + " عدد · " + m[2]; }],
        [/^(\d+) sold$/, function (m) { return m[1] + " فروخته شد"; }],
        [/^(.+) each$/, function (m) { return "هر عدد " + m[1]; }],
        [/^Showing (\d+) to (\d+) of (\d+) products$/, function (m) { return "نمایش " + m[1] + " تا " + m[2] + " از " + m[3] + " محصول"; }],
        [/^Showing (\d+) to (\d+) of (\d+) sales$/, function (m) { return "نمایش " + m[1] + " تا " + m[2] + " از " + m[3] + " فروش"; }],

        /* alerts built from several lines */
        [/^Product: (.*)$/, function (m) { return "محصول: " + m[1]; }],
        [/^Invoice: (.*)$/, function (m) { return "فاکتور: " + m[1]; }],
        [/^Total: (.*)$/, function (m) { return "مجموع: " + m[1]; }],
        [/^Current stock: (.*)$/, function (m) { return "موجودی فعلی: " + m[1]; }],
        [/^(.+) is not connected yet\.$/, function (m) { return tr(m[1]) + " هنوز وصل نشده است."; }],
        [/^(.+) sign-in isn't connected yet\.$/, function (m) { return "ورود با " + m[1] + " هنوز وصل نشده است."; }],
        [/^"(.+)" is out of stock\. Please restock it\.$/, function (m) { return "«" + m[1] + "» ختم شده است. لطفاً دوباره تهیه کنید."; }],
        [/^"(.+)" is out of stock\.$/, function (m) { return "«" + m[1] + "» ختم شده است."; }],
        [/^"(.+)" no longer has enough stock\. Please review the cart\.$/, function (m) { return "موجودی «" + m[1] + "» دیگر کافی نیست. سبد را بررسی کنید."; }],
        [/^Only (\d+) unit\(s\) of "(.+)" available\.$/, function (m) { return "فقط " + m[1] + " عدد از «" + m[2] + "» موجود است."; }],
        [/^Delete "(.+)"\? This cannot be undone\.$/, function (m) { return "«" + m[1] + "» حذف شود؟ این کار قابل بازگشت نیست."; }],
        [/^How many units of "(.+)" are you adding to stock\?$/, function (m) { return "چند عدد از «" + m[1] + "» به موجودی اضافه می‌کنید؟"; }],
        [/^Received amount \((.+)\) is less than the total due \((.+)\)\.$/, function (m) { return "مبلغ دریافتی (" + m[1] + ") کمتر از مبلغ قابل پرداخت (" + m[2] + ") است."; }],

        /* notification messages */
        [/^"(.+)" has only (\d+) left\. You should purchase more soon\.$/, function (m) { return "از «" + m[1] + "» فقط " + m[2] + " عدد باقی مانده است. به‌زودی باید دوباره تهیه کنید."; }],
        [/^(.+) was added to your inventory\.$/, function (m) { return m[1] + " به موجودی شما اضافه شد."; }],
        [/^(.+) was deleted from your inventory\.$/, function (m) { return m[1] + " از موجودی شما حذف شد."; }],
        [/^(.+) was updated\.$/, function (m) { return m[1] + " به‌روزرسانی شد."; }],
        [/^(.+) completed for (.+)$/, function (m) { return m[1] + " به مبلغ " + m[2] + " تکمیل شد"; }],
        [/^(.+) sold for (.+)$/, function (m) { return m[1] + " به مبلغ " + m[2] + " فروخته شد"; }],
        [/^"(.+)" is back in stock \((\d+) available\)\.$/, function (m) { return "«" + m[1] + "» دوباره موجود است (" + m[2] + " عدد)."; }],
        [/^(.+) · \+(\d+) \(now (\d+)\)$/, function (m) { return m[1] + " · +" + m[2] + " (اکنون " + m[3] + ")"; }]
    ];


    /* =====================================================
       TRANSLATION CORE
    ===================================================== */

    function translateCore(core) {
        if (Object.prototype.hasOwnProperty.call(DICT, core)) return DICT[core];

        for (var i = 0; i < RULES.length; i++) {
            var m = core.match(RULES[i][0]);
            if (m) return RULES[i][1](m);
        }

        return core;
    }

    function translate(str) {
        if (typeof str !== "string") return str;

        var core = str.trim();
        if (!core) return str;

        var out = translateCore(core);
        if (out === core) return str;

        var lead = str.match(/^\s*/)[0];
        var trail = str.match(/\s*$/)[0];
        return lead + out + trail;
    }

    /* alert / confirm / prompt messages can have several lines */
    function translateMessage(message) {
        return String(message).split("\n").map(function (line) {
            return line.trim() ? translate(line) : line;
        }).join("\n");
    }

    window.AccountProLang.t = translate;


    /* =====================================================
       DOM TRANSLATION (only when Persian is active)
    ===================================================== */

    var ATTRS = ["placeholder", "title", "aria-label"];
    var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };

    function translateAttrs(el) {
        for (var i = 0; i < ATTRS.length; i++) {
            var value = el.getAttribute(ATTRS[i]);
            if (value) {
                var next = translate(value);
                if (next !== value) el.setAttribute(ATTRS[i], next);
            }
        }
    }

    function translateNode(node) {
        if (node.nodeType === 3) {
            var parent = node.parentNode;
            if (!parent || SKIP[parent.nodeName]) return;

            var next = translate(node.nodeValue);
            if (next !== node.nodeValue) node.nodeValue = next;
            return;
        }

        if (node.nodeType !== 1 || SKIP[node.nodeName]) return;

        if (node.hasAttribute("data-i18n-html")) {
            var key = node.getAttribute("data-i18n-html");
            if (HTML_DICT[key]) {
                node.innerHTML = HTML_DICT[key];
                return;
            }
        }

        translateAttrs(node);

        var children = node.childNodes;
        for (var i = 0; i < children.length; i++) translateNode(children[i]);
    }

    function startTranslating() {
        translateNode(document.documentElement);

        var observer = new MutationObserver(function (records) {
            observer.disconnect();

            records.forEach(function (record) {
                if (record.type === "childList") {
                    record.addedNodes.forEach(translateNode);
                } else if (record.type === "characterData") {
                    translateNode(record.target);
                } else if (record.type === "attributes") {
                    translateAttrs(record.target);
                }
            });

            observe();
        });

        function observe() {
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                attributeFilter: ATTRS
            });
        }

        observe();
    }


    /* =====================================================
       PERSIAN-ONLY: dialogs, dates, font
    ===================================================== */

    if (LANG === "fa") {

        /* alert / confirm / prompt */
        var nativeAlert = window.alert.bind(window);
        var nativeConfirm = window.confirm.bind(window);
        var nativePrompt = window.prompt.bind(window);

        window.alert = function (message) { return nativeAlert(translateMessage(message)); };
        window.confirm = function (message) { return nativeConfirm(translateMessage(message)); };
        window.prompt = function (message, value) { return nativePrompt(translateMessage(message), value); };

        /* dates: Gregorian calendar with Persian (Afghan) month names,
           Latin digits, so they match the numbers shown elsewhere */
        var FA_LOCALE = "fa-AF-u-ca-gregory-nu-latn";

        ["toLocaleDateString", "toLocaleTimeString", "toLocaleString"].forEach(function (name) {
            var original = Date.prototype[name];

            Date.prototype[name] = function (locale, options) {
                var useDefault =
                    locale === undefined ||
                    locale === "en-US" ||
                    (Array.isArray(locale) && locale.length === 0);

                if (useDefault) {
                    try {
                        return original.call(this, FA_LOCALE, options);
                    } catch (e) { /* fall through to the normal call */ }
                }

                return original.call(this, locale, options);
            };
        });

        /* Persian-friendly font */
        var font = document.createElement("link");
        font.rel = "stylesheet";
        font.href = "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap";
        document.head.appendChild(font);
    }


    /* =====================================================
       LANGUAGE SWITCHER (icon next to the notification bell)
    ===================================================== */

    function setLanguage(code) {
        try {
            localStorage.setItem(KEY, code === "fa" ? "fa" : "en");
        } catch (e) { /* ignore */ }

        window.location.reload();
    }

    function buildSwitcher(extraClass) {
        var wrapper = document.createElement("div");
        wrapper.className = "lang-wrapper " + (extraClass || "");

        wrapper.innerHTML =
            '<button type="button" class="lang-btn" aria-label="Language" title="Language">' +
                '<i class="fa-solid fa-language"></i>' +
            '</button>' +
            '<div class="lang-menu">' +
                '<button type="button" data-lang="en" class="' + (LANG === "en" ? "active" : "") + '">English</button>' +
                '<button type="button" data-lang="fa" class="' + (LANG === "fa" ? "active" : "") + '">فارسی</button>' +
            '</div>';

        var button = wrapper.querySelector(".lang-btn");
        var menu = wrapper.querySelector(".lang-menu");

        button.addEventListener("click", function (event) {
            event.stopPropagation();
            menu.classList.toggle("show");
        });

        menu.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        menu.querySelectorAll("[data-lang]").forEach(function (item) {
            item.addEventListener("click", function () {
                if (item.getAttribute("data-lang") !== LANG) {
                    setLanguage(item.getAttribute("data-lang"));
                } else {
                    menu.classList.remove("show");
                }
            });
        });

        document.addEventListener("click", function () {
            menu.classList.remove("show");
        });

        return wrapper;
    }

    function injectSwitcher() {
        var right = document.querySelector(".topbar-right");

        if (right) {
            var bell = right.querySelector(".notification-wrapper");
            right.insertBefore(buildSwitcher(), bell || right.firstChild);
            return;
        }

        /* login page: no top bar - sit beside the dark mode button */
        if (document.getElementById("theme-toggle")) {
            document.body.appendChild(buildSwitcher("lang-login"));
        }
    }

    function init() {
        injectSwitcher();
        if (LANG === "fa") startTranslating();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();