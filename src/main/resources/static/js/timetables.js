let allTimetables = [];
let editingTimetable = null;

document.addEventListener("DOMContentLoaded", function () {
  initPage("Timetables");
  setupTimetableAdminUi();
  loadTimetables();
});

function setupTimetableAdminUi() {
  const role = String(getRole() || "").toUpperCase();
  const isAdmin = role === "ADMIN";
  const actions = document.getElementById("adminTimetableActions");
  if (actions) actions.style.display = isAdmin ? "flex" : "none";
  document.querySelectorAll(".admin-only-col").forEach(el => el.style.display = isAdmin ? "table-cell" : "none");

  const addBtn = document.getElementById("addTimetableBtn");
  if (addBtn) addBtn.addEventListener("click", () => openTimetableModal());
  const closeBtn = document.getElementById("timetableModalClose");
  const cancelBtn = document.getElementById("timetableCancel");
  if (closeBtn) closeBtn.addEventListener("click", () => closeModal("timetableModalOverlay"));
  if (cancelBtn) cancelBtn.addEventListener("click", () => closeModal("timetableModalOverlay"));
  setupModalClose("timetableModalOverlay");
  const form = document.getElementById("timetableForm");
  if (form) form.addEventListener("submit", saveTimetable);
}

async function loadTimetables() {
  showSpinner();
  try {
    const role = String(getRole() || "").toUpperCase();
    const user = currentUser();
    const data = await getTimetables();
    let entries = Array.isArray(data) ? data : [];

    if (role === "LECTURER" || role === "STUDENT") {
      entries = entries.filter(t => {
        const targetRole = String(t.targetRole || "ALL").toUpperCase();
        const targetEmail = String(t.targetEmail || "").toLowerCase().trim();
        const email = String(user.email || "").toLowerCase().trim();
        return (targetRole === "ALL" || targetRole === role) && (!targetEmail || targetEmail === email);
      });
      document.getElementById("timetableHeading").textContent = role === "LECTURER" ? "My Lecturer Timetable" : "My Student Timetable";
      document.getElementById("timetableSubtitle").textContent = "These timetable entries are assigned to your account.";
    } else {
      document.getElementById("timetableHeading").textContent = "Manage Timetables";
      document.getElementById("timetableSubtitle").textContent = "Admin can add, edit, and delete student and lecturer timetables.";
    }

    allTimetables = entries;
    renderTimetable();
  } catch (error) {
    console.error(error);
    showToast("Failed to load timetable", "error");
  } finally {
    hideSpinner();
  }
}

function renderTimetable() {
  const tbody = document.getElementById("timetablesBody");
  if (!tbody) return;
  const isAdmin = String(getRole() || "").toUpperCase() === "ADMIN";
  if (!allTimetables.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:40px;color:#64748b">No timetable entries found.</td></tr>`;
    return;
  }
  tbody.innerHTML = allTimetables.map(t => `
    <tr>
      <td>${safe(t.day)}</td><td>${safe(formatTime(t.startTime, t.endTime))}</td><td>${safe(t.moduleCode)}</td><td>${safe(t.moduleName)}</td><td>${safe(t.hall)}</td><td>${safe(t.lecturer)}</td><td>${safe(t.targetRole || 'ALL')}</td><td>${safe(t.targetEmail || 'All')}</td><td>${safe(t.semester)}</td>
      <td style="display:${isAdmin ? 'table-cell' : 'none'}"><button class="btn btn-sm btn-primary" onclick="openTimetableModal(${t.id})">Edit</button> <button class="btn btn-sm btn-danger" onclick="removeTimetable(${t.id})">Delete</button></td>
    </tr>`).join("");
}

function openTimetableModal(id = null) {
  editingTimetable = id ? allTimetables.find(t => Number(t.id) === Number(id)) : null;
  document.getElementById("timetableModalTitle").textContent = editingTimetable ? "Edit Timetable" : "Add Timetable";
  const t = editingTimetable || {};
  setVal("timetableId", t.id || ""); setVal("targetRole", t.targetRole || "STUDENT"); setVal("targetEmail", t.targetEmail || ""); setVal("day", t.day || "Monday"); setVal("semester", t.semester || "Semester 1"); setVal("startTime", t.startTime || "09:00"); setVal("endTime", t.endTime || "11:00"); setVal("moduleCode", t.moduleCode || ""); setVal("moduleName", t.moduleName || ""); setVal("hall", t.hall || ""); setVal("lecturer", t.lecturer || "");
  openModal("timetableModalOverlay");
}

async function saveTimetable(e) {
  e.preventDefault();
  const payload = { targetRole: val("targetRole"), targetEmail: val("targetEmail"), day: val("day"), semester: val("semester"), startTime: val("startTime"), endTime: val("endTime"), moduleCode: val("moduleCode"), moduleName: val("moduleName"), hall: val("hall"), lecturer: val("lecturer") };
  if (!payload.day || !payload.startTime || !payload.endTime || !payload.moduleCode || !payload.moduleName) { showToast("Please fill required timetable fields", "warning"); return; }
  showSpinner();
  try {
    const id = val("timetableId");
    if (id) await updateTimetable(id, payload); else await createTimetable(payload);
    closeModal("timetableModalOverlay");
    showToast("Timetable saved successfully", "success");
    await loadTimetables();
  } catch (err) { console.error(err); } finally { hideSpinner(); }
}

function removeTimetable(id) {
  confirmDelete(async () => { showSpinner(); try { await deleteTimetable(id); showToast("Timetable deleted", "success"); await loadTimetables(); } finally { hideSpinner(); } });
}
function val(id){ return (document.getElementById(id)?.value || "").trim(); }
function setVal(id,v){ const el=document.getElementById(id); if(el) el.value=v; }
function formatTime(start,end){ if(!start&&!end)return "-"; return start&&end?`${start} - ${end}`:(start||end); }
function safe(value){ return value===null||value===undefined||value===""?"-":value; }
