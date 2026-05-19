let allResults = [];
let editingResult = null;

document.addEventListener("DOMContentLoaded", function () {
  const role = String(getRole() || "").toUpperCase();
  initPage(role === "STUDENT" ? "My Results" : "Results");
  setupResultModal();
  loadResults();
});

async function loadResults() {
  showSpinner();
  try {
    const role = String(getRole() || "").toUpperCase();
    const user = currentUser();
    const results = await getResults();
    allResults = Array.isArray(results) ? results : [];

    if (role === "LECTURER" || role === "ADMIN") {
      renderLecturerResults(allResults, role);
    } else {
      const studentResults = allResults.filter(r => {
        const sid = String(r.studentId || "");
        const semail = String(r.studentEmail || "");
        return sid === String(user.id || "") || semail === String(user.email || "");
      });
      renderStudentResults(studentResults.length ? studentResults : allResults);
    }
  } catch (error) {
    console.error(error);
    showToast("Failed to load results", "error");
  } finally {
    hideSpinner();
  }
}

function renderLecturerResults(results, role) {
  const isAdmin = role === "ADMIN";
  document.getElementById("resultsTitle").textContent = isAdmin ? "Manage All Results" : "Student Results";
  document.getElementById("resultsSubtitle").textContent = isAdmin
      ? "Admin can edit or delete every result and submitted exam mark."
      : "Lecturer can mark/edit PDF exam results and update student grades.";
  document.getElementById("resultSheetHeader").textContent = isAdmin ? "All Results Management" : "All Student Results";

  document.getElementById("resultsTableHead").innerHTML = `
    <tr>
      <th>Student ID</th><th>Student Name</th><th>Module Code</th><th>Module / Exam</th>
      <th>Marks</th><th>Grade</th><th>Status</th><th>Exam Type</th><th>Source</th><th>Actions</th>
    </tr>`;

  const tbody = document.getElementById("resultsBody");
  if (!results.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="result-empty-row">No student results found.</td></tr>`;
    return;
  }

  tbody.innerHTML = results.map((r, i) => `
    <tr>
      <td>${safe(r.studentId)}</td>
      <td>${safe(r.studentName)}</td>
      <td>${safe(r.moduleCode)}</td>
      <td>${safe(r.moduleName || r.examTitle)}</td>
      <td>${formatMarks(r.marks)}</td>
      <td><span class="result-grade-badge">${safe(r.grade)}</span></td>
      <td>${safe(r.status)}</td>
      <td>${safe(r.examType)}</td>
      <td>${safe(r.sourceType || "RESULT")}</td>
      <td>
        ${canEditResult(r, role) ? `<button class="btn btn-sm btn-primary" onclick="openResultEditor(${i})"><i class="fas fa-pen"></i> Edit</button>` : `<span class="text-muted">Auto marked</span>`}
        ${isAdmin ? `<button class="btn btn-sm btn-danger" onclick="removeResult(${i})"><i class="fas fa-trash"></i></button>` : ""}
      </td>
    </tr>`).join("");
}

function renderStudentResults(results) {
  document.getElementById("resultsTitle").textContent = "My Results";
  document.getElementById("resultsSubtitle").textContent = "View your published exam marks and grades.";
  document.getElementById("resultSheetHeader").textContent = "Year 1 | Semester 1 | Semester GPA: " + calculateGpa(results);

  document.getElementById("resultsTableHead").innerHTML = `
    <tr><th>Subject Code</th><th>Subject</th><th>Marks</th><th>Grade</th><th>Status</th></tr>`;

  const tbody = document.getElementById("resultsBody");
  if (!results.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="result-empty-row">No results found.</td></tr>`;
    return;
  }

  tbody.innerHTML = results.map(r => `
    <tr><td>${safe(r.moduleCode)}</td><td>${safe(r.moduleName || r.examTitle || "-")}</td>
    <td>${formatMarks(r.marks)}</td><td><span class="result-grade-badge">${safe(r.grade)}</span></td><td>${safe(r.status)}</td></tr>`).join("");
}

function setupResultModal() {
  document.getElementById("resultCancel")?.addEventListener("click", closeResultEditor);
  document.getElementById("resultModalClose")?.addEventListener("click", closeResultEditor);
  document.getElementById("resultSave")?.addEventListener("click", saveResultEdit);
  document.getElementById("resultMarks")?.addEventListener("input", function () {
    const marks = Number(this.value);
    if (!isNaN(marks)) {
      document.getElementById("resultGrade").value = gradeFromMarks(marks);
      document.getElementById("resultStatus").value = marks >= 40 ? "Pass" : "Fail";
    }
  });
}

function canEditResult(r, role) {
  role = String(role || getRole() || "").toUpperCase();
  if (role === "ADMIN") return true;
  // Lecturers can manually edit only PDF exam submissions. Poll exams are auto checked.
  return role === "LECTURER" && String(r.sourceType || "").toUpperCase() === "SUBMISSION" && String(r.examType || "").toUpperCase() === "PDF";
}

function openResultEditor(index) {
  editingResult = allResults[index];
  if (!canEditResult(editingResult, getRole())) { showToast("Lecturer can edit PDF exam results only. Poll results are auto marked.", "error"); return; }
  if (!editingResult) return;
  document.getElementById("resultStudentId").value = editingResult.studentId || "";
  document.getElementById("resultStudentName").value = editingResult.studentName || "";
  document.getElementById("resultModuleCode").value = editingResult.moduleCode || "";
  document.getElementById("resultModuleName").value = editingResult.moduleName || editingResult.examTitle || "";
  document.getElementById("resultMarks").value = editingResult.marks ?? "";
  document.getElementById("resultGrade").value = editingResult.grade || "";
  document.getElementById("resultStatus").value = editingResult.status || "";
  document.getElementById("resultSemester").value = editingResult.semester || "";
  openModal("resultModalOverlay");
}

function closeResultEditor() {
  editingResult = null;
  closeModal("resultModalOverlay");
}

async function saveResultEdit() {
  if (!editingResult) return;
  const data = {
    studentId: document.getElementById("resultStudentId").value.trim(),
    studentName: document.getElementById("resultStudentName").value.trim(),
    moduleCode: document.getElementById("resultModuleCode").value.trim(),
    moduleName: document.getElementById("resultModuleName").value.trim(),
    marks: Number(document.getElementById("resultMarks").value || 0),
    grade: document.getElementById("resultGrade").value.trim(),
    status: document.getElementById("resultStatus").value.trim(),
    semester: document.getElementById("resultSemester").value.trim()
  };
  try {
    if ((editingResult.sourceType || "").toUpperCase() === "SUBMISSION") {
      await updateSubmissionResult(editingResult.sourceId, data);
    } else {
      await updateResult(editingResult.sourceId || editingResult.id, data);
    }
    showToast("Result updated successfully", "success");
    closeResultEditor();
    loadResults();
  } catch (e) {
    showToast(e.message || "Failed to update result", "error");
  }
}

function removeResult(index) {
  const r = allResults[index];
  if (!r) return;
  confirmDelete(async () => {
    try {
      if ((r.sourceType || "").toUpperCase() === "SUBMISSION") await deleteSubmissionResult(r.sourceId);
      else await deleteResult(r.sourceId || r.id);
      showToast("Result deleted", "success");
      loadResults();
    } catch (e) { showToast(e.message || "Failed to delete result", "error"); }
  });
}

function gradeFromMarks(marks) { if (marks >= 75) return "A"; if (marks >= 65) return "B"; if (marks >= 55) return "C"; if (marks >= 40) return "D"; return "F"; }
function formatMarks(marks) { if (marks === null || marks === undefined || marks === "") return "-"; return `${Number(marks).toFixed(2)}%`; }
function calculateGpa(results) { const valid = results.filter(r => r.marks !== null && r.marks !== undefined && !isNaN(r.marks)); if (!valid.length) return "0.00"; const avg = valid.reduce((sum, r) => sum + Number(r.marks), 0) / valid.length; return ((avg / 100) * 4).toFixed(2); }
function safe(value) { return value === null || value === undefined || value === "" ? "-" : value; }
