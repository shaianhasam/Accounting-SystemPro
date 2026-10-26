// ==========================================
// AUTH SYSTEM
// ==========================================

const loginCard = document.getElementById("login-card");
const signupCard = document.getElementById("signup-card");

const goToSignup = document.getElementById("go-to-signup");
const goToLogin = document.getElementById("go-to-login");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");


// ==========================================
// SWITCH LOGIN / SIGNUP
// ==========================================

goToSignup.addEventListener("click", function (e) {
    e.preventDefault();

    loginCard.classList.remove("active");
    signupCard.classList.add("active");
});


goToLogin.addEventListener("click", function (e) {
    e.preventDefault();

    signupCard.classList.remove("active");
    loginCard.classList.add("active");
});


// ==========================================
// SIGN UP
// ==========================================

signupForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const fullName =
        signupForm.querySelectorAll('input[type="text"]')[0].value.trim();

    const businessName =
        signupForm.querySelectorAll('input[type="text"]')[1].value.trim();

    const email =
        document.getElementById("signup-email").value.trim().toLowerCase();

    const password =
        signupForm.querySelector('input[type="password"]').value;

    const photoInput =
        document.getElementById("profile-photo");


    // ======================================
    // VALIDATION
    // ======================================

    if (!fullName || !businessName || !email || !password) {

        alert("Please fill in all fields.");

        return;
    }


    if (password.length < 8) {

        alert("Password must be at least 8 characters.");

        return;
    }


    // ======================================
    // GET EXISTING USERS
    // ======================================

    const users =
        JSON.parse(localStorage.getItem("accountProUsers")) || [];


    // ======================================
    // CHECK EMAIL
    // ======================================

    const existingUser =
        users.find(function (user) {

            return user.email === email;

        });


    if (existingUser) {

        alert("An account with this email already exists.");

        // Show login form
        signupCard.classList.remove("active");
        loginCard.classList.add("active");

        document.getElementById("login-email").value = email;

        return;
    }


    // ======================================
    // SAVE USER
    // ======================================

    if (photoInput && photoInput.files.length > 0) {

        const reader = new FileReader();

        reader.onload = function () {

            createUser(
                fullName,
                businessName,
                email,
                password,
                reader.result
            );

        };

        reader.readAsDataURL(photoInput.files[0]);

    } else {

        createUser(
            fullName,
            businessName,
            email,
            password,
            ""
        );
    }

});


// ==========================================
// CREATE USER
// ==========================================

function createUser(
    fullName,
    businessName,
    email,
    password,
    photo
) {

    // Get users
    const users =
        JSON.parse(localStorage.getItem("accountProUsers")) || [];


    // New user
    const user = {

        id: Date.now(),

        fullName: fullName,

        businessName: businessName,

        email: email,

        password: password,

        photo: photo
    };


    // Add user
    users.push(user);


    // Save all users
    localStorage.setItem(
        "accountProUsers",
        JSON.stringify(users)
    );


    // ======================================
    // LOG THE NEW ACCOUNT IN IMMEDIATELY
    // ----------------------------------------
    // This MUST set both keys, exactly like the
    // Login handler below does. dashboard.js and
    // product.js both check for "accountProCurrentUser"
    // - without it they redirect straight back here,
    // which was the bug causing signup to appear broken.
    // ======================================

    localStorage.setItem(
        "accountProCurrentUser",
        JSON.stringify(user)
    );

    localStorage.setItem(
        "accountProLoggedIn",
        "true"
    );

    window.location.href = "dashboard.html";
}


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();


    const email =
        document.getElementById("login-email").value.trim().toLowerCase();

    const password =
        document.getElementById("login-password").value;


    // Get users
    const users =
        JSON.parse(localStorage.getItem("accountProUsers")) || [];


    // ======================================
    // NO ACCOUNT
    // ======================================

    if (users.length === 0) {

        alert(
            "No account found. Please create an account first."
        );

        loginCard.classList.remove("active");
        signupCard.classList.add("active");

        return;
    }


    // ======================================
    // FIND USER
    // ======================================

    const user =
        users.find(function (user) {

            return (
                user.email === email &&
                user.password === password
            );

        });


    // ======================================
    // LOGIN SUCCESS
    // ======================================

    if (user) {

        localStorage.setItem(
            "accountProCurrentUser",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "accountProLoggedIn",
            "true"
        );

        window.location.href = "dashboard.html";

    } else {

        alert(
            "Incorrect email or password. Please try again."
        );
    }

});


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

const passwordToggles =
    document.querySelectorAll(".toggle-password");


passwordToggles.forEach(function (toggle) {

    toggle.addEventListener("click", function () {

        const input =
            this.parentElement.querySelector("input");


        if (input.type === "password") {

            input.type = "text";

            this.classList.remove("fa-eye");

            this.classList.add("fa-eye-slash");

        } else {

            input.type = "password";

            this.classList.remove("fa-eye-slash");

            this.classList.add("fa-eye");
        }

    });

});


// ==========================================
// DARK MODE
// ----------------------------------------
// Uses the SAME localStorage key ("dashboardTheme")
// as dashboard.js / product.js / sales.js / sales-history.js,
// so switching the theme here also applies once the user
// logs in, and vice versa.
// ==========================================

const themeToggleBtn = document.getElementById("theme-toggle");
const themeToggleIcon = document.getElementById("theme-toggle-icon");

function applyLoginTheme() {

    const dark = localStorage.getItem("dashboardTheme") === "dark";

    document.body.classList.toggle("dark", dark);

    if (themeToggleIcon) {
        themeToggleIcon.className = dark
            ? "fa-regular fa-moon"
            : "fa-regular fa-sun";
    }
}

applyLoginTheme();

if (themeToggleBtn) {

    themeToggleBtn.addEventListener("click", function () {

        const dark = !document.body.classList.contains("dark");

        document.body.classList.toggle("dark", dark);

        localStorage.setItem("dashboardTheme", dark ? "dark" : "light");

        if (themeToggleIcon) {
            themeToggleIcon.className = dark
                ? "fa-regular fa-moon"
                : "fa-regular fa-sun";
        }
    });
}


// ==========================================
// SOCIAL SIGN-IN BUTTONS (Google / Microsoft / GitHub)
// ----------------------------------------
// Not wired to a real OAuth provider yet - this keeps
// them honest instead of silently doing nothing.
// ==========================================

document.querySelectorAll(".social-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        const provider = btn.dataset.provider || "This sign-in method";
        alert(provider + " sign-in isn't connected yet.");
    });
});

// ==========================================
// CREATE USER
// ==========================================

function createUser(
    fullName,
    businessName,
    email,
    password,
    photo
) {

    // Get users
    const users =
        JSON.parse(localStorage.getItem("accountProUsers")) || [];


    // New user
    const user = {

        id: Date.now(),

        fullName: fullName,

        businessName: businessName,

        email: email,

        password: password,

        photo: photo
    };


    // Add user
    users.push(user);


    // Save all users
    localStorage.setItem(
        "accountProUsers",
        JSON.stringify(users)
    );


    // ======================================
    // تغییرات جدید: نمایش پیام و انتقال به فرم لاگین
    // ======================================
    
    // ۱. نمایش پیام موفقیت به کاربر
   alert("Account created successfully! Please enter your email and password to sign in.");
    // ۲. خالی کردن فرم ثبت‌نام (تا اگر دوباره برگشت فرم خالی باشد)
    document.getElementById("signup-form").reset();

    // ۳. قرار دادن خودکار ایمیل در فرم ورود برای راحتی کاربر
    document.getElementById("login-email").value = email;

    // ۴. پنهان کردن فرم ثبت‌نام و نمایش فرم ورود (Sign In)
    document.getElementById("signup-card").classList.remove("active");
    document.getElementById("login-card").classList.add("active");
    
    // ۵. فوکوس کردن روی فیلد رمز عبور تا کاربر سریع رمزش را بزند
    document.getElementById("login-password").focus();
}