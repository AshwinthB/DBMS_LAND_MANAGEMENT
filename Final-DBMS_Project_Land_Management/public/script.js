async function sendOtp() {
    const email = document.getElementById("email").value;
    const res = await fetch("/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    const data = await res.json();
    document.getElementById("register-message").textContent = data.message;
}

async function register() {
    const name = document.getElementById("name").value;
    const gender = document.getElementById("gender").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const mobile = document.getElementById("mobile").value;
    const otp = document.getElementById("otp").value;
    const message = document.getElementById("register-message");

    const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender, email, password, mobile, otp })
    });

    const data = await response.json();
    message.textContent = data.message;
    if (response.ok) {
        setTimeout(() => window.location.href = "index.html", 1500);
    }
}

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const message = document.getElementById("login-message");

    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    message.textContent = data.message;

    if (response.ok) {
        setTimeout(() => {
            switch (data.role) {
                case "admin":
                    window.location.href = "admin.html";
                    break;
                case "bank":
                    window.location.href = "bank.html";
                    break;
                case "court":
                    window.location.href = "court.html";
                    break;
                default:
                    window.location.href = "normal_user.html";
            }
        }, 1000);
    }
}
