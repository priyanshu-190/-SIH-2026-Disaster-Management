// ========================================
// GET ELEMENTS
// ========================================

const loginForm = document.getElementById("loginForm");

const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

const loginButton = document.getElementById("loginButton");

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

const roleInput = document.getElementById("role");
const authorityIdInput = document.getElementById("authorityId");


// ========================================
// SHOW / HIDE PASSWORD
// ========================================

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "Hide";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "Show";

    }

});


// ========================================
// LOGIN FORM
// ========================================

loginForm.addEventListener("submit", async (e) => {

    // VERY IMPORTANT:
    // Prevent the browser from refreshing the page
    e.preventDefault();

    // ========================================
    // GET FORM VALUES
    // ========================================

    const role = roleInput.value;

    const authorityId =
        authorityIdInput.value.trim();

    const password =
        passwordInput.value;


    // ========================================
    // CLEAR OLD ERROR
    // ========================================

    errorMessage.classList.add("hidden");
    errorText.textContent = "";


    // ========================================
    // CHECK ROLE
    // ========================================

    if (!role) {

        errorText.textContent =
            "Please select whether you are an Authority or Relief Team.";

        errorMessage.classList.remove("hidden");

        return;
    }


    // ========================================
    // CHECK LOGIN ID
    // ========================================

    if (!authorityId) {

        errorText.textContent =
            "Please enter your Login ID.";

        errorMessage.classList.remove("hidden");

        return;
    }


    // ========================================
    // CHECK PASSWORD
    // ========================================

    if (!password) {

        errorText.textContent =
            "Please enter your password.";

        errorMessage.classList.remove("hidden");

        return;
    }


    // ========================================
    // DISABLE BUTTON
    // ========================================

    loginButton.disabled = true;
    loginButton.textContent = "Signing In...";


    try {

        // ========================================
        // SEND LOGIN REQUEST TO BACKEND
        // ========================================

        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                role: role,

                authorityId: authorityId,

                password: password

            })

        });


        // ========================================
        // READ RESPONSE
        // ========================================

        let data = {};

        try {

            data = await response.json();

        } catch (jsonError) {

            console.error(
                "Server returned invalid JSON:",
                jsonError
            );

        }


        // ========================================
        // LOGIN FAILED
        // ========================================

        if (!response.ok) {

            errorText.textContent =
                data.message ||
                "Invalid Login ID or Password.";

            errorMessage.classList.remove("hidden");

            loginButton.disabled = false;
            loginButton.textContent = "Sign In";

            return;
        }


        // ========================================
        // LOGIN SUCCESSFUL
        // ========================================

        console.log("Login successful:", data);
        console.log("Selected role:", role);


        // ========================================
        // AUTHORITY
        // ========================================

        if (role === "authority") {

            window.location.href = "/dashboard";

            return;
        }


        // ========================================
        // RELIEF TEAM
        // ========================================

        if (role === "relief-team") {

            window.location.href = "/disaster-relief";

            return;
        }


        // ========================================
        // SUPPORT OLD ROLE VALUES
        // ========================================

        if (
            role === "rescue" ||
            role === "rescue-team" ||
            role === "relief"
        ) {

            window.location.href = "/disaster-relief";

            return;
        }


        // ========================================
        // UNKNOWN ROLE
        // ========================================

        errorText.textContent =
            "Unknown user role.";

        errorMessage.classList.remove("hidden");

        loginButton.disabled = false;
        loginButton.textContent = "Sign In";


    } catch (error) {

        // ========================================
        // NETWORK / SERVER ERROR
        // ========================================

        console.error(
            "Login error:",
            error
        );

        errorText.textContent =
            "Unable to connect to server. Please make sure the backend is running.";

        errorMessage.classList.remove("hidden");

        loginButton.disabled = false;
        loginButton.textContent = "Sign In";

    }

});


// ========================================
// RESET BUTTON WHEN PAGE IS SHOWN
// ========================================

window.addEventListener("pageshow", () => {

    loginButton.disabled = false;

    loginButton.textContent = "Sign In";

});