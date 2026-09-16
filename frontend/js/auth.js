const API_URL = "https://codealpha-project-management-api.onrender.com/api";

// Register
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("registerName").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            const message = document.getElementById("registerMessage");
            message.textContent = data.message;

            if (response.ok) {
                registerForm.reset();

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);
            }

        } catch (error) {
            document.getElementById("registerMessage").textContent =
                "Unable to connect to server.";
        }
    });
}


// Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            const message = document.getElementById("loginMessage");
            message.textContent = data.message;

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                setTimeout(() => {
                    window.location.href = "projects.html";
                }, 500);
            }

        } catch (error) {
            document.getElementById("loginMessage").textContent =
                "Unable to connect to server.";
        }
    });
}
