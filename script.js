// ===============================
// AUTH SYSTEM
// ===============================

const loginCard = document.getElementById("login-card");
const signupCard = document.getElementById("signup-card");

const goToSignup = document.getElementById("go-to-signup");
const goToLogin = document.getElementById("go-to-login");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");


// ===============================
// SWITCH LOGIN / SIGNUP
// ===============================

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


// ===============================
// SIGN UP
// ===============================

signupForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const fullName =
        signupForm.querySelector('input[type="text"]').value.trim();

    const businessName =
        signupForm.querySelectorAll('input[type="text"]')[1].value.trim();

    const email =
        document.getElementById("signup-email").value.trim();

    const password =
        signupForm.querySelector('input[type="password"]').value;

    const photoInput =
        document.getElementById("profile-photo");


    // Check existing account
    const existingUser = localStorage.getItem("accountProUser");

    if (existingUser) {

        const user = JSON.parse(existingUser);

        if (user.email === email) {

            alert("An account with this email already exists.");

            return;
        }
    }


    // Password length
    if (password.length < 8) {

        alert("Password must be at least 8 characters.");

        return;
    }


    // Save user after reading image
    if (photoInput.files.length > 0) {

        const reader = new FileReader();

        reader.onload = function () {

            saveUser(
                fullName,
                businessName,
                email,
                password,
                reader.result
            );

        };

        reader.readAsDataURL(photoInput.files[0]);

    } else {

        saveUser(
            fullName,
            businessName,
            email,
            password,
            ""
        );
    }

});


// ===============================
// SAVE USER
// ===============================

function saveUser(fullName, businessName, email, password, photo) {

    const user = {

        fullName: fullName,

        businessName: businessName,

        email: email,

        password: password,

        photo: photo
    };


    localStorage.setItem(
        "accountProUser",
        JSON.stringify(user)
    );


    alert("Account created successfully! Please sign in.");

    // Clear signup form
    signupForm.reset();


    // Go to Login
    signupCard.classList.remove("active");
    loginCard.classList.add("active");


    // Put email automatically in login
    document.getElementById("login-email").value = email;
}


// ===============================
// LOGIN
// ===============================

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();


    const email =
        document.getElementById("login-email").value.trim();

    const password =
        document.getElementById("login-password").value;


    // Get saved account
    const savedUser =
        localStorage.getItem("accountProUser");


    // No account
    if (!savedUser) {

        alert(
            "No account found. Please create an account first."
        );

        signupCard.classList.add("active");
        loginCard.classList.remove("active");

        return;
    }


    const user = JSON.parse(savedUser);


    // Check login information
    if (
        email === user.email &&
        password === user.password
    ) {

        // Save login status
        localStorage.setItem(
            "accountProLoggedIn",
            "true"
        );


        // Go dashboard
        window.location.href = "dashboard.html";

    } else {

        alert(
            "Incorrect email or password. Please try again."
        );
    }

});


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

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