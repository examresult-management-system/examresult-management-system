let allLecturers = [], allFacultiesForLecturers = [], filteredLecturers = [], lCurrentPage = 1, lPerPage = 10, lEditingId = null;

document.addEventListener('DOMContentLoaded', () => { initPage('Lecturers'); loadLecturers(); setupLEvents(); });

async function loadLecturers() {
  showSpinner();
  try { [allLecturers, allFacultiesForLecturers] = await Promise.all([getLecturers(), getFaculties()]); populateLFilters(); applyLFilters(); } catch (err) { showToast('Failed to load lecturers', 'error'); }
  finally { hideSpinner(); }
}

function populateLFilters() {
  const faculties = allFacultiesForLecturers.length ? allFacultiesForLecturers.map(f => f.name).filter(Boolean) : [...new Set(allLecturers.map(l => l.faculty).filter(Boolean))];
  const facultyFilter = document.getElementById('facultyFilter');
  if (facultyFilter) facultyFilter.innerHTML = '<option value="">All Faculties</option>' + faculties.map(f => `<option value="${f}">${f}</option>`).join('');
  const lecturerFaculty = document.getElementById('lecturerFaculty');
  if (lecturerFaculty && lecturerFaculty.tagName === 'SELECT') lecturerFaculty.innerHTML = faculties.map(f => `<option value="${f}">${f}</option>`).join('');
}

function applyLFilters() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const faculty = document.getElementById('facultyFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';
  filteredLecturers = allLecturers.filter(l => {
    return (!search || String(l.name || '').toLowerCase().includes(search) || String(l.email || '').toLowerCase().includes(search)) &&
           (!faculty || l.faculty === faculty) && (!status || l.status === status);
  });
  lCurrentPage = 1; renderLTable();
}

function renderLTable() {
  const tbody = document.getElementById('lecturersBody');
  if (!tbody) return;
  if (filteredLecturers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state" style="padding:40px"><div class="empty-state-icon"><i class="fas fa-chalkboard-teacher"></i></div><h3>No lecturers found</h3><p>Try adjusting your search or filters</p></div></td></tr>';
    document.getElementById('lecturersPagination').innerHTML = ''; return;
  }
  const p = paginate(filteredLecturers, lCurrentPage, lPerPage);
  tbody.innerHTML = p.items.map(l => `
    <tr><td>#${l.id}</td><td><strong>${l.name}</strong></td><td>${l.email}</td><td>${l.department}</td><td>${l.faculty}</td><td>${getStatusBadge(l.status)}</td>
    <td><div class="table-actions">
      <button class="btn btn-ghost btn-icon btn-sm" onclick="editLecturer(${l.id})" title="Edit"><i class="fas fa-pen"></i></button>
      <button class="btn btn-ghost btn-icon btn-sm" onclick="viewLecturer(${l.id})" title="View"><i class="fas fa-eye"></i></button>
      <button class="btn btn-ghost btn-icon btn-sm" onclick="delLecturer(${l.id})" title="Delete" style="color:var(--error)"><i class="fas fa-trash"></i></button>
    </div></td></tr>`).join('');
  renderPagination('lecturersPagination', p.page, p.pages, goToLPage);
}

function goToLPage(page) { lCurrentPage = page; renderLTable(); }

function setupLEvents() {
  setupSearch('searchInput', applyLFilters);
  setupFilter('facultyFilter', applyLFilters);
  setupFilter('statusFilter', applyLFilters);
  document.getElementById('addLecturerBtn')?.addEventListener('click', () => { lEditingId = null; document.getElementById('lecturerModalTitle').textContent = 'Add Lecturer'; document.getElementById('lecturerForm').reset(); openModal('lecturerModalOverlay'); });
  document.getElementById('lecturerModalClose')?.addEventListener('click', () => closeModal('lecturerModalOverlay'));
  document.getElementById('lecturerCancel')?.addEventListener('click', () => closeModal('lecturerModalOverlay'));
  document.getElementById('lecturerSave')?.addEventListener('click', saveLecturer);
  setupModalClose('lecturerModalOverlay');
}

function editLecturer(id) {
  const l = allLecturers.find(x => x.id === id); if (!l) return;
  lEditingId = id; document.getElementById('lecturerModalTitle').textContent = 'Edit Lecturer';
  document.getElementById('lecturerName').value = l.name; document.getElementById('lecturerEmail').value = l.email;
  document.getElementById('lecturerDepartment').value = l.department; document.getElementById('lecturerFaculty').value = l.faculty;
  document.getElementById('lecturerStatus').value = l.status; openModal('lecturerModalOverlay');
}

function viewLecturer(id) { const l = allLecturers.find(x => x.id === id); if (l) showToast(`Lecturer: ${l.name} — ${l.department}`, 'info'); }

function delLecturer(id) {
  confirmDelete(async () => {
    try { await deleteLecturer(id); allLecturers = allLecturers.filter(x => x.id !== id); applyLFilters(); showToast('Lecturer deleted successfully', 'success'); }
    catch (err) { showToast(err.message || 'Failed to delete', 'error'); }
  });
}

async function saveLecturer() {
  const name = document.getElementById('lecturerName').value.trim(), email = document.getElementById('lecturerEmail').value.trim();
  const department = document.getElementById('lecturerDepartment').value.trim(), faculty = document.getElementById('lecturerFaculty').value;
  const status = document.getElementById('lecturerStatus').value;
  if (!name || !email || !department) { showToast('Please fill in all required fields', 'warning'); return; }
  const data = { name, email, department, faculty, status };
  try {
    if (lEditingId) { await updateLecturer(lEditingId, data); const i = allLecturers.findIndex(x => x.id === lEditingId); if (i >= 0) allLecturers[i] = { ...allLecturers[i], ...data }; showToast('Lecturer updated successfully', 'success'); }
    else { const nl = await createLecturer(data); allLecturers.push(nl); showToast('Lecturer added successfully', 'success'); }
    closeModal('lecturerModalOverlay'); applyLFilters();
  } catch (err) { showToast(err.message || 'Failed to save lecturer', 'error'); }
}
