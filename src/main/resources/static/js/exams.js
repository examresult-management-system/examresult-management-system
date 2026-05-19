let allExams = [];
let filteredExams = [];

document.addEventListener("DOMContentLoaded", function () {
  initPage(String(getRole() || "").toUpperCase() === "ADMIN" ? "Manage Exams" : "My Exams");
  loadExams();
  setupExamEvents();
});

async function loadExams() {
  showSpinner();

  try {
    const user = currentUser();
    const role = String(getRole() || user.role || "").toUpperCase();

    let apiExams = [];

    if (role === "STUDENT" && user.faculty) {
      apiExams = await getExamsByFaculty(user.faculty);
    } else {
      apiExams = await getExams();
    }

    allExams = Array.isArray(apiExams)
        ? apiExams.map((exam, index) => normalizeExam(exam, index))
        : [];

    if (role === "STUDENT") {
      for (let exam of allExams) {
        try {
          const status = await getExamSubmissionStatus(exam.id);
          exam.submitted = status.submitted === true;
        } catch (e) {
          exam.submitted = false;
        }
      }
    }

    applyExamFilters();

  } catch (error) {
    console.error(error);
    allExams = [];
    applyExamFilters();
  } finally {
    hideSpinner();
  }
}

function normalizeExam(exam, index) {
  return {
    id: exam.id || index + 1,
    subjectCode: exam.moduleCode || exam.subjectCode || exam.code || "EXAM",
    title: exam.subject || exam.title || exam.subjectName || "Exam",
    location: exam.hall || exam.location || "-",
    date: exam.examDate || exam.date || "",
    rawTime: exam.examTime || "",
    time: formatTimeRange(exam.examTime, exam.duration) || exam.time || "-",
    seatNo: exam.seatNo || exam.seatNumber || "-",
    sessionNo: exam.sessionNo || exam.session || "Session 1",
    type: exam.examType || exam.type || "Exam",
    status: exam.status || "Scheduled",
    faculty: exam.faculty || "",
    submitted: false
  };
}

function setupExamEvents() {
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const typeFilter = document.getElementById("typeFilter");

  if (searchInput) {
    searchInput.addEventListener("input", applyExamFilters);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyExamFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", applyExamFilters);
  }
}

function applyExamFilters() {
  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const status = document.getElementById("statusFilter")?.value || "";
  const type = document.getElementById("typeFilter")?.value || "";

  filteredExams = allExams.filter(exam => {
    const matchesSearch =
        !search ||
        exam.title.toLowerCase().includes(search) ||
        exam.subjectCode.toLowerCase().includes(search) ||
        exam.location.toLowerCase().includes(search) ||
        exam.faculty.toLowerCase().includes(search);

    const matchesStatus =
        !status ||
        exam.status.toLowerCase() === status.toLowerCase();

    const matchesType =
        !type ||
        exam.type.toLowerCase() === type.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  renderExamTable();
}

function renderExamTable() {
  const tbody =
      document.getElementById("examsTableBody") ||
      document.getElementById("examTableBody");

  if (!tbody) return;

  if (!filteredExams.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="exam-empty-row" style="text-align:center;padding:40px;color:#64748b;">
          No exams found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredExams.map(exam => `
    <tr>
      <td>${safe(exam.subjectCode)}</td>
      <td>${safe(exam.title)}</td>
      <td>${safe(exam.location)}</td>
      <td>${formatExamDateTime(exam.date, exam.time)}</td>
      <td>${safe(exam.seatNo)}</td>
      <td>${safe(exam.sessionNo)}</td>
      <td>${renderStatusButton(exam)}</td>
      <td>${renderActionButton(exam)}</td>
    </tr>
  `).join("");
}

function renderStatusButton(exam) {
  if (exam.submitted === true) {
    return `
      <span class="exam-status-btn completed">
        Finished
      </span>
    `;
  }

  const now = new Date();
  const examStart = getExamStartDate(exam);

  if (examStart && now < examStart) {
    return `
      <span class="exam-status-btn upcoming">
        Not Started
      </span>
    `;
  }

  return `
    <span class="exam-status-btn active">
      Active
    </span>
  `;
}

function renderActionButton(exam) {
  const role = String(getRole() || "").toUpperCase();
  if (role === "ADMIN") {
    return `<button type="button" class="exam-action-btn active" onclick="adminEditExam(${exam.id})"><i class="fas fa-pen"></i> Edit</button>
            <button type="button" class="exam-action-btn closed" onclick="adminDeleteExam(${exam.id})"><i class="fas fa-trash"></i> Delete</button>`;
  }
  if (role === "LECTURER") {
    return `<button type="button" class="exam-action-btn active" onclick="adminEditExam(${exam.id})"><i class="fas fa-pen"></i> Edit</button>`;
  }
  if (exam.submitted === true) {
    return `
      <button type="button" class="exam-action-btn closed" disabled>
        <i class="fas fa-check-circle"></i>
        Finished
      </button>
    `;
  }

  const now = new Date();
  const examStart = getExamStartDate(exam);

  if (examStart && now < examStart) {
    return `
      <button type="button" class="exam-action-btn upcoming" disabled>
        <i class="fas fa-clock"></i>
        Not Started
      </button>
    `;
  }

  return `
    <a href="exam-attempt.html?id=${exam.id}" class="exam-action-btn active">
      <i class="fas fa-pen-to-square"></i>
      Attempt
    </a>
  `;
}

function getExamStartDate(exam) {
  const examDate = exam.date;
  const examTime = exam.rawTime || "00:00";

  if (!examDate) return null;

  const date = new Date(`${examDate}T${examTime}`);

  if (isNaN(date.getTime())) return null;

  return date;
}

function formatExamDateTime(date, time) {
  if (!date) return time || "-";

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return `${date} ${time || ""}`;
  }

  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString("en-US", { month: "short" });
  const year = parsedDate.getFullYear();

  return `${day} ${month} ${year} ${time || ""}`;
}

function formatTimeRange(startTime, duration) {
  if (!startTime) return "";

  const parts = String(startTime).split(":");

  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  if (isNaN(hour) || isNaN(minute)) return startTime;

  const startDate = new Date();
  startDate.setHours(hour, minute, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + Number(duration || 1));

  return `${formatAMPM(startDate)} to ${formatAMPM(endDate)}`;
}

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  minutes = minutes < 10 ? "0" + minutes : minutes;

  return `${hours}:${minutes} ${ampm}`;
}

function safe(value) {
  return value === null || value === undefined || value === "" ? "-" : value;
}

function adminEditExam(id) {
  const exam = allExams.find(e => String(e.id) === String(id));
  if (!exam) return;
  const title = prompt("Exam title / subject:", exam.title || "");
  if (title === null) return;
  const moduleCode = prompt("Module code:", exam.subjectCode || "");
  if (moduleCode === null) return;
  const hall = prompt("Hall / location:", exam.location || "");
  if (hall === null) return;
  const status = prompt("Status (Scheduled/Upcoming/Active/Completed/Closed):", exam.status || "Scheduled");
  if (status === null) return;
  updateExam(id, {
    subject: title,
    moduleCode: moduleCode,
    hall: hall,
    faculty: exam.faculty || "",
    examDate: exam.date,
    examTime: exam.rawTime || "00:00",
    duration: 1,
    status: status,
    examType: exam.type || "PDF",
    enrollmentKey: exam.enrollmentKey || "1234"
  }).then(() => { showToast("Exam updated", "success"); loadExams(); })
    .catch(e => showToast(e.message || "Failed to update exam", "error"));
}

function adminDeleteExam(id) {
  confirmDelete(async () => {
    try { await deleteExam(id); showToast("Exam deleted", "success"); loadExams(); }
    catch (e) { showToast(e.message || "Failed to delete exam", "error"); }
  });
}
