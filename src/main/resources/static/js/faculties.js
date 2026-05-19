let allFaculties = [], filteredFaculties = [], fCurrentPage = 1, fPerPage = 10, fEditingId = null;

document.addEventListener('DOMContentLoaded', () => { initPage('Faculties'); loadFaculties(); setupFEvents(); });

async function loadFaculties() { showSpinner(); try { allFaculties = await getFaculties(); applyFFilters(); } catch (e) { showToast('Failed to load faculties', 'error'); } finally { hideSpinner(); } }

function applyFFilters() {
  const s = document.getElementById('searchInput')?.value.toLowerCase() || '';
  filteredFaculties = allFaculties.filter(f => !s || f.name.toLowerCase().includes(s) || f.code.toLowerCase().includes(s));
  fCurrentPage = 1; renderFTable();
}

function renderFTable() {
  const tbody = document.getElementById('facultiesBody'); if (!tbody) return;
  if (filteredFaculties.length === 0) { tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state" style="padding:40px"><div class="empty-state-icon"><i class="fas fa-university"></i></div><h3>No faculties found</h3><p>Try adjusting your search</p></div></td></tr>'; document.getElementById('facultiesPagination').innerHTML = ''; return; }
  const p = paginate(filteredFaculties, fCurrentPage, fPerPage);
  tbody.innerHTML = p.items.map(f => `<tr><td><strong>${f.code}</strong></td><td>${f.name}</td><td>${f.description}</td><td>${getStatusBadge(f.status)}</td>
    <td><div class="table-actions"><button class="btn btn-ghost btn-icon btn-sm" onclick="editFaculty(${f.id})" title="Edit"><i class="fas fa-pen"></i></button>
    <button class="btn btn-ghost btn-icon btn-sm" onclick="delFaculty(${f.id})" title="Delete" style="color:var(--error)"><i class="fas fa-trash"></i></button></div></td></tr>`).join('');
  renderPagination('facultiesPagination', p.page, p.pages, goToFPage);
}

function goToFPage(page) { fCurrentPage = page; renderFTable(); }

function setupFEvents() {
  setupSearch('searchInput', applyFFilters);
  document.getElementById('addFacultyBtn')?.addEventListener('click', () => { fEditingId = null; document.getElementById('facultyModalTitle').textContent = 'Add Faculty'; document.getElementById('facultyForm').reset(); openModal('facultyModalOverlay'); });
  document.getElementById('facultyModalClose')?.addEventListener('click', () => closeModal('facultyModalOverlay'));
  document.getElementById('facultyCancel')?.addEventListener('click', () => closeModal('facultyModalOverlay'));
  document.getElementById('facultySave')?.addEventListener('click', saveFaculty);
  setupModalClose('facultyModalOverlay');
}

function editFaculty(id) { const f = allFaculties.find(x => x.id === id); if (!f) return; fEditingId = id; document.getElementById('facultyModalTitle').textContent = 'Edit Faculty';
  document.getElementById('facultyCode').value = f.code; document.getElementById('facultyName').value = f.name;
  document.getElementById('facultyDescription').value = f.description; document.getElementById('facultyStatus').value = f.status; openModal('facultyModalOverlay'); }

function delFaculty(id) { confirmDelete(async () => { try { await deleteFaculty(id); allFaculties = allFaculties.filter(x => x.id !== id); applyFFilters(); showToast('Faculty deleted', 'success'); } catch (e) { showToast(e.message || 'Failed to delete', 'error'); } }); }

async function saveFaculty() {
  const code = document.getElementById('facultyCode').value.trim(), name = document.getElementById('facultyName').value.trim();
  const description = document.getElementById('facultyDescription').value.trim(), status = document.getElementById('facultyStatus').value;
  if (!code || !name) { showToast('Please fill in all required fields', 'warning'); return; }
  const data = { code, name, description, status };
  try { if (fEditingId) { await updateFaculty(fEditingId, data); const i = allFaculties.findIndex(x => x.id === fEditingId); if (i >= 0) allFaculties[i] = { ...allFaculties[i], ...data }; showToast('Faculty updated', 'success'); }
    else { const nf = await createFaculty(data); allFaculties.push(nf); showToast('Faculty added', 'success'); }
    closeModal('facultyModalOverlay'); applyFFilters();
  } catch (e) { showToast(e.message || 'Failed to save faculty', 'error'); }
}
