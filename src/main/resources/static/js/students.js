// ============================================
// Students.js — CRUD operations
// ============================================

let allStudents = [];
let filteredStudents = [];
let currentPage = 1;
let perPage = 10;
let editingId = null;
let deletingId = null;
let allCoursesForStudents = [];
let allFacultiesForStudents = [];

document.addEventListener('DOMContentLoaded', () => {
  initPage('Students');
  loadStudents();
  setupEventListeners();
});

async function loadStudents() {
  showSpinner();
  try {
    [allStudents, allCoursesForStudents, allFacultiesForStudents] = await Promise.all([getStudents(), getCourses(), getFaculties()]);
    populateFilters();
    applyFilters();
  } catch (err) {
    showToast('Failed to load students', 'error');
  } finally {
    hideSpinner();
  }
}

function populateFilters() {
  const faculties = allFacultiesForStudents.length ? allFacultiesForStudents.map(f => f.name).filter(Boolean) : [...new Set(allStudents.map(s => s.faculty).filter(Boolean))];
  const facultyFilter = document.getElementById('facultyFilter');
  if (facultyFilter) facultyFilter.innerHTML = '<option value="">All Faculties</option>' + faculties.map(f => `<option value="${f}">${f}</option>`).join('');
  const modalFaculty = document.getElementById('studentFaculty');
  if (modalFaculty) {
    if (modalFaculty.tagName === 'SELECT') modalFaculty.innerHTML = '<option value="">Select Faculty</option>' + faculties.map(f => `<option value="${f}">${f}</option>`).join('');
  }
  const courses = allCoursesForStudents.length ? allCoursesForStudents.map(c => c.name).filter(Boolean) : [...new Set(allStudents.map(s => s.course).filter(Boolean))];
  const modalCourse = document.getElementById('studentCourse');
  if (modalCourse) {
    if (modalCourse.tagName === 'SELECT') modalCourse.innerHTML = '<option value="">Select Course</option>' + courses.map(c => `<option value="${c}">${c}</option>`).join('');
  }
}
function applyFilters() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const faculty = document.getElementById('facultyFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';

  filteredStudents = allStudents.filter(s => {
    const matchSearch = !search || String(s.name || '').toLowerCase().includes(search) || String(s.email || '').toLowerCase().includes(search);
    const matchFaculty = !faculty || s.faculty === faculty;
    const matchStatus = !status || s.status === status;
    return matchSearch && matchFaculty && matchStatus;
  });

  currentPage = 1;
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('studentsBody');
  const pagination = document.getElementById('studentsPagination');
  if (!tbody) return;

  if (filteredStudents.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state" style="padding:40px"><div class="empty-state-icon"><i class="fas fa-user-graduate"></i></div><h3>No students found</h3><p>Try adjusting your search or filters</p></div></td></tr>';
    pagination.innerHTML = '';
    return;
  }

  const paginated = paginate(filteredStudents, currentPage, perPage);

  tbody.innerHTML = paginated.items.map(s => `
    <tr>
      <td>#${s.id}</td>
      <td><strong>${s.name}</strong></td>
      <td>${s.email}</td>
      <td>${s.faculty}</td>
      <td>${s.course}</td>
      <td>${getStatusBadge(s.status)}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editStudent(${s.id})" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="viewStudent(${s.id})" title="View"><i class="fas fa-eye"></i></button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="removeStudent(${s.id})" title="Delete" style="color:var(--error)"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination('studentsPagination', paginated.page, paginated.pages, goToPage);
}

function goToPage(page) {
  currentPage = page;
  renderTable();
}

function setupEventListeners() {
  setupSearch('searchInput', () => applyFilters());
  setupFilter('facultyFilter', () => applyFilters());
  setupFilter('statusFilter', () => applyFilters());

  document.getElementById('addStudentBtn')?.addEventListener('click', () => openAddModal());
  document.getElementById('studentModalClose')?.addEventListener('click', () => closeModal('studentModalOverlay'));
  document.getElementById('studentCancel')?.addEventListener('click', () => closeModal('studentModalOverlay'));
  document.getElementById('studentSave')?.addEventListener('click', () => saveStudent());
  setupModalClose('studentModalOverlay');
}

function openAddModal() {
  editingId = null;
  document.getElementById('studentModalTitle').textContent = 'Add Student';
  document.getElementById('studentForm').reset();
  document.getElementById('studentId').value = '';
  openModal('studentModalOverlay');
}

function editStudent(id) {
  const student = allStudents.find(s => s.id === id);
  if (!student) return;
  editingId = id;
  document.getElementById('studentModalTitle').textContent = 'Edit Student';
  document.getElementById('studentId').value = student.id;
  document.getElementById('studentName').value = student.name;
  document.getElementById('studentEmail').value = student.email;
  document.getElementById('studentFaculty').value = student.faculty;
  document.getElementById('studentCourse').value = student.course;
  document.getElementById('studentStatus').value = student.status;
  openModal('studentModalOverlay');
}

function viewStudent(id) {
  const student = allStudents.find(s => s.id === id);
  if (!student) return;
  showToast(`Student: ${student.name} — ${student.course}`, 'info');
}

function removeStudent(id) {
  deletingId = id;
  confirmDelete(async () => {
    try {
      await deleteStudent(deletingId);
      allStudents = allStudents.filter(s => s.id !== deletingId);
      applyFilters();
      showToast('Student deleted successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete student', 'error');
    }
  });
}

async function saveStudent() {
  const name = document.getElementById('studentName').value.trim();
  const email = document.getElementById('studentEmail').value.trim();
  const faculty = document.getElementById('studentFaculty').value;
  const course = document.getElementById('studentCourse').value;
  const status = document.getElementById('studentStatus').value;

  if (!name || !email || !course) {
    showToast('Please fill in all required fields', 'warning');
    return;
  }

  const data = { name, email, faculty, course, status };

  try {
    if (editingId) {
      await updateStudent(editingId, data);
      const idx = allStudents.findIndex(s => s.id === editingId);
      if (idx >= 0) allStudents[idx] = { ...allStudents[idx], ...data };
      showToast('Student updated successfully', 'success');
    } else {
      const newStudent = await createStudent(data);
      allStudents.push(newStudent);
      showToast('Student added successfully', 'success');
    }
    closeModal('studentModalOverlay');
    applyFilters();
  } catch (err) {
    showToast(err.message || 'Failed to save student', 'error');
  }
}
