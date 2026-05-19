// ============================================
// API.js — ExamPortal Backend Integration
// ============================================

// IMPORTANT:
// This must be global because other files like auth.js need it.
window.API_BASE_URL = window.location.origin + "/api";

// ============================================
// REQUEST HELPER
// ============================================

async function apiRequest(endpoint, options = {}) {
    try {
        const token = localStorage.getItem("token");

        const config = {
            method: options.method || "GET",
            headers: {
                "Content-Type": "application/json"
            }
        };

        if (token) {
            config.headers["Authorization"] = "Bearer " + token;
        }

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        const fullUrl = window.API_BASE_URL + endpoint;

        console.log("API Request:", fullUrl);

        const response = await fetch(fullUrl, config);

        if (response.status === 204) {
            return { success: true };
        }

        let data = {};

        try {
            data = await response.json();
        } catch (e) {
            data = {};
        }

        if (!response.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;

    } catch (error) {
        console.error("API Error:", error);

        if (typeof showToast === "function") {
            showToast(error.message, "error");
        } else {
            alert(error.message);
        }

        throw error;
    }
}

// ============================================
// AUTH
// ============================================

async function loginApi(data) {
    return apiRequest("/auth/login", {
        method: "POST",
        body: data
    });
}

async function registerApi(data) {
    return apiRequest("/auth/register", {
        method: "POST",
        body: data
    });
}

async function forgotPasswordApi(data) {
    return {
        message: "Forgot password is not connected yet."
    };
}

// ============================================
// STUDENTS
// ============================================

async function getStudents(params = {}) {
    return apiRequest("/students" + buildQuery(params));
}

async function createStudent(data) {
    return apiRequest("/students", {
        method: "POST",
        body: data
    });
}

async function updateStudent(id, data) {
    return apiRequest("/students/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteStudent(id) {
    return apiRequest("/students/" + id, {
        method: "DELETE"
    });
}

// ============================================
// LECTURERS
// ============================================

async function getLecturers(params = {}) {
    return apiRequest("/lecturers" + buildQuery(params));
}

async function createLecturer(data) {
    return apiRequest("/lecturers", {
        method: "POST",
        body: data
    });
}

async function updateLecturer(id, data) {
    return apiRequest("/lecturers/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteLecturer(id) {
    return apiRequest("/lecturers/" + id, {
        method: "DELETE"
    });
}

// ============================================
// COURSES
// ============================================

async function getCourses(params = {}) {
    return apiRequest("/courses" + buildQuery(params));
}

async function createCourse(data) {
    return apiRequest("/courses", {
        method: "POST",
        body: data
    });
}

async function updateCourse(id, data) {
    return apiRequest("/courses/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteCourse(id) {
    return apiRequest("/courses/" + id, {
        method: "DELETE"
    });
}

// ============================================
// FACULTIES
// ============================================

async function getFaculties(params = {}) {
    return apiRequest("/faculties" + buildQuery(params));
}

async function createFaculty(data) {
    return apiRequest("/faculties", {
        method: "POST",
        body: data
    });
}

async function updateFaculty(id, data) {
    return apiRequest("/faculties/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteFaculty(id) {
    return apiRequest("/faculties/" + id, {
        method: "DELETE"
    });
}

// ============================================
// MODULES
// ============================================

async function getModules(params = {}) {
    return apiRequest("/modules" + buildQuery(params));
}

async function createModule(data) {
    return apiRequest("/modules", {
        method: "POST",
        body: data
    });
}

async function updateModule(id, data) {
    return apiRequest("/modules/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteModule(id) {
    return apiRequest("/modules/" + id, {
        method: "DELETE"
    });
}

// ============================================
// EXAMS
// ============================================



async function getExams(params = {}) {
    return apiRequest("/exams" + buildQuery(params));
}

async function getExamsByFaculty(faculty) {
    return apiRequest("/exams/faculty/" + encodeURIComponent(faculty));
}

async function createExam(data) {
    return apiRequest("/exams", {
        method: "POST",
        body: data
    });
}

async function updateExam(id, data) {
    return apiRequest("/exams/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteExam(id) {
    return apiRequest("/exams/" + id, {
        method: "DELETE"
    });
}

async function submitExam(id, answers) {
    return {
        success: true,
        message: "Submit exam API is not connected yet."
    };
}

// ============================================
// RESULTS
// ============================================

async function getResults(params = {}) {
    return apiRequest("/results" + buildQuery(params));
}

async function createResult(data) {
    return apiRequest("/results", {
        method: "POST",
        body: data
    });
}

async function updateResult(id, data) {
    return apiRequest("/results/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteResult(id) {
    return apiRequest("/results/" + id, {
        method: "DELETE"
    });
}

async function updateSubmissionResult(id, data) {
    return apiRequest("/results/submission/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteSubmissionResult(id) {
    return apiRequest("/results/submission/" + id, {
        method: "DELETE"
    });
}

// ============================================
// TIMETABLES
// ============================================

async function getTimetables(params = {}) {
    return apiRequest("/timetables" + buildQuery(params));
}

async function createTimetable(data) {
    return apiRequest("/timetables", {
        method: "POST",
        body: data
    });
}

async function updateTimetable(id, data) {
    return apiRequest("/timetables/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteTimetable(id) {
    return apiRequest("/timetables/" + id, {
        method: "DELETE"
    });
}

// ============================================
// ANNOUNCEMENTS
// ============================================

async function getAnnouncements(params = {}) {
    return apiRequest("/announcements" + buildQuery(params));
}

async function createAnnouncement(data) {
    return apiRequest("/announcements", {
        method: "POST",
        body: data
    });
}

async function updateAnnouncement(id, data) {
    return apiRequest("/announcements/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteAnnouncement(id) {
    return apiRequest("/announcements/" + id, {
        method: "DELETE"
    });
}

// ============================================
// USERS / PROFILE
// ============================================

async function getUsers(params = {}) {
    return apiRequest("/users" + buildQuery(params));
}

async function updateUser(id, data) {
    return apiRequest("/users/" + id, {
        method: "PUT",
        body: data
    });
}

async function deleteUser(id) {
    return apiRequest("/users/" + id, {
        method: "DELETE"
    });
}

async function updateProfile(data) {
    return apiRequest("/users/profile", {
        method: "PUT",
        body: data
    });
}

async function changePassword(data) {
    return apiRequest("/users/change-password", {
        method: "POST",
        body: data
    });
}

// ============================================
// UTILITIES
// ============================================

function buildQuery(params = {}) {
    const query = new URLSearchParams(params).toString();
    return query ? "?" + query : "";
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {
        return {};
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

function delay(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
async function createAdvancedExam(data) {
    return apiRequest("/exams/create-new", {
        method: "POST",
        body: data
    });
}

async function getExamForAttempt(id, enrollmentKey) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const studentId = String(user.id || user.email || "STUDENT");

    return apiRequest(
        "/exams/" +
        id +
        "/attempt?enrollmentKey=" +
        encodeURIComponent(enrollmentKey) +
        "&studentId=" +
        encodeURIComponent(studentId)
    );
}

async function getExamSubmissionStatus(id) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const studentId = String(user.id || user.email || "STUDENT");

    return apiRequest(
        "/exams/" + id + "/submission-status?studentId=" + encodeURIComponent(studentId)
    );
}

async function submitPollExam(id, data) {
    return apiRequest("/exams/" + id + "/submit-poll", {
        method: "POST",
        body: data
    });
}

async function submitPdfExam(id, data) {
    return apiRequest("/exams/" + id + "/submit-pdf", {
        method: "POST",
        body: data
    });
}

async function updateProfileById(id, data) {
    return apiRequest("/auth/profile/" + id, {
        method: "PUT",
        body: data
    });
}