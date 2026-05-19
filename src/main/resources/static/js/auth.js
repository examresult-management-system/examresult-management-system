// ============================================
// auth.js — Final Working Version
// ============================================

document.addEventListener("DOMContentLoaded", function () {

  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  // ============================================
  // REGISTER
  // ============================================

  if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

      event.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      const roleElement =
          document.querySelector("input[name='role']:checked");

      const role = roleElement ? roleElement.value : "STUDENT";

      // VALIDATION
      if (!name || !email || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const registerData = {
        name: name,
        email: email,
        password: password,
        role: role
      };

      try {

        const result = await registerApi(registerData);

        console.log("Register Response:", result);

        // SAVE TOKEN
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        // SAVE USER
        if (result.user) {
          localStorage.setItem(
              "user",
              JSON.stringify(result.user)
          );
          localStorage.setItem("userRole", String(result.user.role || "").toUpperCase());

          redirectByRole(result.user.role);

        } else {

          alert("Registration successful");
          window.location.href = "login.html";
        }

      } catch (error) {

        console.error(error);
        alert(error.message || "Registration failed");
      }
    });
  }

  // ============================================
  // LOGIN
  // ============================================

  if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

      event.preventDefault();

      const email =
          document.getElementById("email").value.trim();

      const password =
          document.getElementById("password").value;

      if (!email || !password) {
        alert("Please enter email and password");
        return;
      }

      const loginData = {
        email: email,
        password: password
      };

      try {

        const result = await loginApi(loginData);

        console.log("Login Response:", result);

        // SAVE TOKEN
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        // SAVE USER
        if (result.user) {

          localStorage.setItem(
              "user",
              JSON.stringify(result.user)
          );
          localStorage.setItem("userRole", String(result.user.role || "").toUpperCase());

          redirectByRole(result.user.role);

        } else {

          alert("User data missing from backend response");
        }

      } catch (error) {

        console.error(error);
        alert(error.message || "Login failed");
      }
    });
  }

  // ============================================
  // PASSWORD TOGGLE
  // ============================================

  const toggleButtons =
      document.querySelectorAll(".toggle-password");

  toggleButtons.forEach(function (button) {

    button.addEventListener("click", function () {

      const input =
          button.parentElement.querySelector("input");

      if (input.type === "password") {

        input.type = "text";

        button.classList.remove("fa-eye");
        button.classList.add("fa-eye-slash");

      } else {

        input.type = "password";

        button.classList.remove("fa-eye-slash");
        button.classList.add("fa-eye");
      }
    });
  });

});

// ============================================
// ROLE REDIRECT
// ============================================

function redirectByRole(role) {

  role = String(role).toUpperCase();

  console.log("Redirect Role:", role);

  // IMPORTANT:
  // Change file names below if your pages
  // use different names.

  if (role === "ADMIN") {

    window.location.href = "admin-dashboard.html";
    return;
  }

  if (role === "LECTURER") {

    window.location.href = "lecturer-dashboard.html";
    return;
  }

  if (role === "STUDENT") {

    window.location.href = "student-dashboard.html";
    return;
  }

  // FALLBACK
  window.location.href = "dashboard.html";
}