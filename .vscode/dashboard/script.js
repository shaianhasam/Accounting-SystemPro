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

    localStorage.setItem(
  "accountProLoggedIn",
  "true"
);

window.location.href = "dashboard.html";


    alert("Account created successfully! Please sign in.");


    // Reset form
    signupForm.reset();


    // Show login
    signupCard.classList.remove("active");
    loginCard.classList.add("active");


    // Automatically put email
    document.getElementById("login-email").value = email;
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

