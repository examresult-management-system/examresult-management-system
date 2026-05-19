document.addEventListener("DOMContentLoaded", function () {
    initPage("Profile");

    const user = currentUser();

    document.getElementById("profileName").value = user.name || "";
    document.getElementById("profileEmail").value = user.email || "";
    document.getElementById("profileRole").value = user.role || getRole();

    document.getElementById("profileForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("profileName").value.trim();
        const email = document.getElementById("profileEmail").value.trim();
        const password = document.getElementById("newPassword").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        if (!name || !email) {
            showToast("Name and email are required", "warning");
            return;
        }

        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                showToast("Passwords do not match", "error");
                return;
            }
        }

        const payload = {
            currentEmail: user.email,
            name: name,
            email: email,
            password: password
        };

        try {
            showSpinner();

            const data = await apiRequest("/auth/profile", {
                method: "PUT",
                body: payload
            });

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("userName", data.user.name);
            localStorage.setItem("userEmail", data.user.email);
            localStorage.setItem("userRole", data.user.role.toUpperCase());

            showToast("Profile updated successfully", "success");

            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";

            setTimeout(function () {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error(error);
            showToast("Failed to update profile", "error");
        } finally {
            hideSpinner();
        }
    });
});