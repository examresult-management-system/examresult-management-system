let allUsers = [], filteredUsers = [], uCurrentPage = 1, uPerPage = 10, uEditingId = null;

document.addEventListener('DOMContentLoaded', () => { initPage('Users'); loadUsers(); setupUEvents(); });

async function loadUsers() { showSpinner(); try { allUsers = await getUsers(); applyUFilters(); } catch (e) { showToast('Failed to load users', 'error'); } finally { hideSpinner(); } }

function applyUFilters() {
  const s = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const role = document.getElementById('roleFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';
  filteredUsers = allUsers.filter(u => (!s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) && (!role || u.role === role) && (!status || u.status === status));
  uCurrentPage = 1; renderUTable();
}

function renderUTable() {
  const tbody = document.getElementById('usersBody'); if (!tbody) return;
  if (filteredUsers.length === 0) { tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state" style="padding:40px"><div class="empty-state-icon"><i class="fas fa-users"></i></div><h3>No users found</h3><p>Try adjusting your search or filters</p></div></td></tr>'; document.getElementById('usersPagination').innerHTML = ''; return; }
  const p = paginate(filteredUsers, uCurrentPage, uPerPage);
  const roleIcons = { ADMIN: 'fa-user-shield', STUDENT: 'fa-user-graduate', LECTURER: 'fa-chalkboard-teacher' };
  const roleBadges = { ADMIN: 'badge-primary', STUDENT: 'badge-success', LECTURER: 'badge-info' };
  tbody.innerHTML = p.items.map(u => `<tr><td>#${u.id}</td><td><strong>${u.name}</strong></td><td>${u.email}</td>
    <td><span class="badge ${roleBadges[u.role] || 'badge-neutral'}"><i class="fas ${roleIcons[u.role] || 'fa-user'}" style="margin-right:4px"></i>${u.role}</span></td>
    <td>${getStatusBadge(u.status)}</td>
    <td><div class="table-actions"><button class="btn btn-ghost btn-icon btn-sm" onclick="editUser(${u.id})" title="Edit"><i class="fas fa-pen"></i></button>
    <button class="btn btn-ghost btn-icon btn-sm" onclick="delUser(${u.id})" title="Delete" style="color:var(--error)"><i class="fas fa-trash"></i></button></div></td></tr>`).join('');
  renderPagination('usersPagination', p.page, p.pages, goToUPage);
}

function goToUPage(page) { uCurrentPage = page; renderUTable(); }

function setupUEvents() {
  setupSearch('searchInput', applyUFilters); setupFilter('roleFilter', applyUFilters); setupFilter('statusFilter', applyUFilters);
  document.getElementById('userModalClose')?.addEventListener('click', () => closeModal('userModalOverlay'));
  document.getElementById('userCancel')?.addEventListener('click', () => closeModal('userModalOverlay'));
  document.getElementById('userSave')?.addEventListener('click', saveUser);
  setupModalClose('userModalOverlay');
}

function editUser(id) { const u = allUsers.find(x => x.id === id); if (!u) return; uEditingId = id; document.getElementById('userModalTitle').textContent = 'Edit User';
  document.getElementById('userName').value = u.name; document.getElementById('userEmail').value = u.email;
  document.getElementById('userRole').value = u.role; document.getElementById('userStatus').value = u.status; openModal('userModalOverlay'); }

function delUser(id) { confirmDelete(async () => { try { await deleteUser(id); allUsers = allUsers.filter(x => x.id !== id); applyUFilters(); showToast('User deleted', 'success'); } catch (e) { showToast(e.message || 'Failed to delete', 'error'); } }); }

async function saveUser() {
  const name = document.getElementById('userName').value.trim(), email = document.getElementById('userEmail').value.trim();
  const role = document.getElementById('userRole').value, status = document.getElementById('userStatus').value;
  if (!name || !email) { showToast('Please fill in all required fields', 'warning'); return; }
  const data = { name, email, role, status };
  try { if (uEditingId) { await updateUser(uEditingId, data); const i = allUsers.findIndex(x => x.id === uEditingId); if (i >= 0) allUsers[i] = { ...allUsers[i], ...data }; showToast('User updated', 'success'); }
    closeModal('userModalOverlay'); applyUFilters();
  } catch (e) { showToast(e.message || 'Failed to save user', 'error'); }
}
