let allCourses = [], allFaculties = [], filteredCourses = [], cCurrentPage = 1, cPerPage = 10, cEditingId = null;

document.addEventListener('DOMContentLoaded', () => { initPage('Courses'); loadCourses(); setupCEvents(); });

async function loadCourses() {
  showSpinner();
  try {
    [allCourses, allFaculties] = await Promise.all([getCourses(), getFaculties()]);
    populateCFilters(); applyCFilters();
  } catch (err) { console.error(err); showToast('Failed to load courses', 'error'); }
  finally { hideSpinner(); }
}

function esc(v){return String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function populateCFilters() {
  const faculties = allFaculties.length ? allFaculties.map(f => f.name).filter(Boolean) : [...new Set(allCourses.map(c => c.faculty).filter(Boolean))];
  const filter = document.getElementById('facultyFilter');
  if (filter) filter.innerHTML = '<option value="">All Faculties</option>' + faculties.map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('');
  const modal = document.getElementById('courseFaculty');
  if (modal) modal.innerHTML = '<option value="">Select Faculty</option>' + faculties.map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('');
}
function applyCFilters() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const faculty = document.getElementById('facultyFilter')?.value || '';
  filteredCourses = allCourses.filter(c => (!search || String(c.name||'').toLowerCase().includes(search) || String(c.code||'').toLowerCase().includes(search)) && (!faculty || c.faculty === faculty));
  cCurrentPage = 1; renderCTable();
}
function renderCTable() {
  const tbody = document.getElementById('coursesBody'); if (!tbody) return;
  if (filteredCourses.length === 0) { tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state" style="padding:40px"><div class="empty-state-icon"><i class="fas fa-book"></i></div><h3>No courses found</h3><p>Add a course and assign it to a faculty</p></div></td></tr>'; document.getElementById('coursesPagination').innerHTML = ''; return; }
  const p = paginate(filteredCourses, cCurrentPage, cPerPage);
  tbody.innerHTML = p.items.map(c => `<tr><td><strong>${esc(c.code)}</strong></td><td>${esc(c.name)}</td><td>${esc(c.faculty)}</td><td>${esc(c.credits ?? '-')}</td><td>${esc(c.duration ?? '-')}</td><td>${getStatusBadge(c.status || 'Active')}</td><td><div class="table-actions"><button class="btn btn-ghost btn-icon btn-sm" onclick="editCourse(${c.id})" title="Edit"><i class="fas fa-pen"></i></button><button class="btn btn-ghost btn-icon btn-sm" onclick="delCourse(${c.id})" title="Delete" style="color:var(--error)"><i class="fas fa-trash"></i></button></div></td></tr>`).join('');
  renderPagination('coursesPagination', p.page, p.pages, goToCPage);
}
function goToCPage(page) { cCurrentPage = page; renderCTable(); }
function setupCEvents() {
  setupSearch('searchInput', applyCFilters); setupFilter('facultyFilter', applyCFilters);
  document.getElementById('addCourseBtn')?.addEventListener('click', () => { cEditingId = null; document.getElementById('courseModalTitle').textContent = 'Add Course'; document.getElementById('courseForm').reset(); populateCFilters(); openModal('courseModalOverlay'); });
  document.getElementById('courseModalClose')?.addEventListener('click', () => closeModal('courseModalOverlay'));
  document.getElementById('courseCancel')?.addEventListener('click', () => closeModal('courseModalOverlay'));
  document.getElementById('courseSave')?.addEventListener('click', saveCourse);
  setupModalClose('courseModalOverlay');
}
function editCourse(id) { const c = allCourses.find(x => x.id === id); if (!c) return; cEditingId = id; document.getElementById('courseModalTitle').textContent = 'Edit Course'; populateCFilters(); document.getElementById('courseCode').value = c.code || ''; document.getElementById('courseName').value = c.name || ''; document.getElementById('courseFaculty').value = c.faculty || ''; document.getElementById('courseCredits').value = c.credits || ''; document.getElementById('courseDuration').value = c.duration || ''; document.getElementById('courseStatus').value = c.status || 'Active'; openModal('courseModalOverlay'); }
function delCourse(id) { confirmDelete(async () => { try { await deleteCourse(id); await loadCourses(); showToast('Course deleted', 'success'); } catch (err) { showToast(err.message || 'Failed to delete', 'error'); } }); }
async function saveCourse() {
  const data = { code: document.getElementById('courseCode').value.trim(), name: document.getElementById('courseName').value.trim(), faculty: document.getElementById('courseFaculty').value, credits: parseInt(document.getElementById('courseCredits').value || '0'), duration: document.getElementById('courseDuration').value.trim(), status: document.getElementById('courseStatus').value };
  if (!data.code || !data.name || !data.faculty) { showToast('Please fill course code, name and faculty', 'warning'); return; }
  try { if (cEditingId) await updateCourse(cEditingId, data); else await createCourse(data); closeModal('courseModalOverlay'); await loadCourses(); showToast('Course saved', 'success'); } catch (err) { showToast(err.message || 'Failed to save course', 'error'); }
}
