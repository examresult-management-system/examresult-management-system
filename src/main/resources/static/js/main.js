// ============================================
// Main.js — Shared utilities for all pages
// ============================================

const currentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const getRole = () => localStorage.getItem('userRole') || '';
const getToken = () => localStorage.getItem('token') || '';

function checkAuth() {
  const token = getToken();
  const role = getRole();

  if (!token || !role) {
    window.location.href = 'login.html';
    return false;
  }

  return true;
}

const navMenus = {
  ADMIN: [
    {
      section: null,
      items: [
        { icon: 'fa-tachometer-alt', label: 'Dashboard', href: 'admin-dashboard.html' },
        { icon: 'fa-user-graduate', label: 'Students', href: 'students.html' },
        { icon: 'fa-chalkboard-teacher', label: 'Lecturers', href: 'lecturers.html' },
        { icon: 'fa-book', label: 'Courses', href: 'courses.html' },
        { icon: 'fa-university', label: 'Faculties', href: 'faculties.html' },
        { icon: 'fa-cubes', label: 'Modules', href: 'modules.html' }
      ]
    },
    {
      section: 'Examination',
      items: [
        { icon: 'fa-file-alt', label: 'Exams', href: 'exams.html' },
        { icon: 'fa-plus-circle', label: 'Create Exam', href: 'create-exam.html' },
        { icon: 'fa-chart-bar', label: 'Results', href: 'results.html' },
        { icon: 'fa-calendar-alt', label: 'Timetables', href: 'timetables.html' }
      ]
    },
    {
      section: 'Communication',
      items: [
        { icon: 'fa-bullhorn', label: 'Announcements', href: 'announcements.html' },
        { icon: 'fa-users-cog', label: 'Users', href: 'users.html' }
      ]
    }
  ],

  STUDENT: [
    {
      section: null,
      items: [
        { icon: 'fa-tachometer-alt', label: 'Dashboard', href: 'student-dashboard.html' },
        { icon: 'fa-file-alt', label: 'My Exams', href: 'exams.html' },
        { icon: 'fa-chart-bar', label: 'My Results', href: 'results.html' }
      ]
    },
    {
      section: 'Schedule',
      items: [
        { icon: 'fa-calendar-alt', label: 'Timetable', href: 'timetables.html' },
        { icon: 'fa-bullhorn', label: 'Announcements', href: 'announcements.html' }
      ]
    }
  ],

  LECTURER: [
    {
      section: null,
      items: [
        { icon: 'fa-tachometer-alt', label: 'Dashboard', href: 'lecturer-dashboard.html' },
        { icon: 'fa-plus-circle', label: 'Create Exam', href: 'create-exam.html' },
        { icon: 'fa-chart-bar', label: 'Results', href: 'results.html' }
      ]
    },
    {
      section: 'Schedule',
      items: [
        { icon: 'fa-calendar-alt', label: 'Timetable', href: 'timetables.html' },
        { icon: 'fa-bullhorn', label: 'Announcements', href: 'announcements.html' }
      ]
    }
  ]
};

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const role = getRole();
  const menu = navMenus[role] || navMenus.ADMIN;
  const currentPage = window.location.pathname.split('/').pop() || '';

  let html = `
    <div class="sidebar-header">
      <div class="logo">
        <i class="fas fa-graduation-cap"></i>
        <span>ExamPortal</span>
      </div>
      <button class="sidebar-close" id="sidebarClose">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
  `;

  menu.forEach(group => {
    if (group.section) {
      html += `<div class="nav-section">${group.section}</div>`;
    }

    group.items.forEach(item => {
      const isActive = currentPage === item.href.split('?')[0];

      html += `
        <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
          <i class="fas ${item.icon}"></i>
          <span>${item.label}</span>
        </a>
      `;
    });
  });

  html += `
    </nav>

    <div class="sidebar-footer">
      <a href="profile.html" class="nav-item ${currentPage === 'profile.html' ? 'active' : ''}">
        <i class="fas fa-user"></i>
        <span>Profile</span>
      </a>

      <button class="logout-btn" id="logoutBtn">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  `;

  sidebar.innerHTML = html;

  const sidebarClose = document.getElementById('sidebarClose');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const logoutBtn = document.getElementById('logoutBtn');

  let backdrop = document.querySelector('.sidebar-backdrop');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }

  backdrop.addEventListener('click', closeSidebar);

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

function renderNavbar() {
  const navbar = document.getElementById('topNavbar');
  if (!navbar) return;

  const user = currentUser();

  const initials = (user.name || 'U')
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  navbar.innerHTML = `
    <div class="navbar-left">
      <button class="sidebar-toggle" id="sidebarToggle">
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="page-title" id="pageTitle">
        ${document.title.split('|')[0].trim()}
      </h1>
    </div>

    <div class="navbar-right">
      <div class="navbar-search">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search..." id="globalSearch">
      </div>

      <button class="notification-btn" id="notificationBtn">
        <i class="fas fa-bell"></i>
        <span class="notification-badge">3</span>
      </button>

      <div class="navbar-user" id="navbarUser">
        <div class="user-avatar">${initials}</div>
        <span class="user-name">${user.name || 'User'}</span>
        <i class="fas fa-chevron-down" style="font-size:10px;color:var(--text-muted)"></i>

        <div class="user-dropdown" id="userDropdown">
          <div class="dropdown-user-info">
            <div class="user-avatar" style="width:40px;height:40px;font-size:16px">
              ${initials}
            </div>
            <div class="user-details">
              <div class="name">${user.name || 'User'}</div>
              <div class="role">${getRole()}</div>
            </div>
          </div>

          <div class="dropdown-menu">
            <a href="profile.html">
              <i class="fas fa-user"></i> Profile
            </a>
            <a href="#" class="logout-link" id="logoutLink">
              <i class="fas fa-sign-out-alt"></i> Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  const navbarUser = document.getElementById('navbarUser');
  const userDropdown = document.getElementById('userDropdown');
  const logoutLink = document.getElementById('logoutLink');

  if (navbarUser && userDropdown) {
    navbarUser.addEventListener('click', e => {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.remove('open');
    });
  }

  if (logoutLink) {
    logoutLink.addEventListener('click', e => {
      e.preventDefault();
      handleLogout();
    });
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('user');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');

  window.location.href = 'login.html';
}

function showToast(message, type = 'success', title = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const titles = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info'
  };

  const icons = {
    success: 'fa-check',
    error: 'fa-exclamation',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${icons[type]}"></i>
    </div>

    <div class="toast-content">
      <div class="toast-title">${title || titles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>

    <button class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });

  container.appendChild(toast);

  setTimeout(() => {
    removeToast(toast);
  }, 4000);
}

function removeToast(toast) {
  if (!toast.parentElement) return;

  toast.classList.add('hiding');

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 300);
}

function showSpinner() {
  const overlay = document.getElementById('spinnerOverlay');
  if (overlay) overlay.classList.add('active');
}

function hideSpinner() {
  const overlay = document.getElementById('spinnerOverlay');
  if (overlay) overlay.classList.remove('active');
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);

  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function setupModalClose(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal(modalId);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal(modalId);
    }
  });
}

let deleteCallback = null;

function confirmDelete(callback) {
  deleteCallback = callback;
  openModal('deleteModalOverlay');
}

function setupDeleteConfirm() {
  const confirmBtn = document.getElementById('deleteConfirm');
  const cancelBtn = document.getElementById('deleteCancel');

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (deleteCallback) {
        deleteCallback();
        deleteCallback = null;
      }

      closeModal('deleteModalOverlay');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      deleteCallback = null;
      closeModal('deleteModalOverlay');
    });
  }

  setupModalClose('deleteModalOverlay');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';

  const d = new Date(dateStr);

  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';

  const d = new Date(dateStr);

  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatNumber(num) {
  if (num === undefined || num === null) return '0';

  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function timeAgo(dateStr) {
  if (!dateStr) return '';

  const d = new Date(dateStr);

  if (isNaN(d.getTime())) return dateStr;

  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return formatDate(dateStr);
}

function getGradeClass(grade) {
  if (!grade) return '';

  const g = grade.toString().toUpperCase();

  if (g.startsWith('A')) return 'grade-a';
  if (g.startsWith('B')) return 'grade-b';
  if (g.startsWith('C')) return 'grade-c';
  if (g.startsWith('D')) return 'grade-d';

  return 'grade-f';
}

function getStatusBadge(status) {
  const map = {
    active: 'badge-success',
    Active: 'badge-success',
    ACTIVE: 'badge-success',
    inactive: 'badge-neutral',
    Inactive: 'badge-neutral',
    INACTIVE: 'badge-neutral',
    pending: 'badge-warning',
    Pending: 'badge-warning',
    PENDING: 'badge-warning',
    completed: 'badge-success',
    Completed: 'badge-success',
    COMPLETED: 'badge-success',
    upcoming: 'badge-info',
    Upcoming: 'badge-info',
    UPCOMING: 'badge-info',
    published: 'badge-success',
    Published: 'badge-success',
    draft: 'badge-warning',
    Draft: 'badge-warning',
    graded: 'badge-success',
    Graded: 'badge-success',
    submitted: 'badge-info',
    Submitted: 'badge-info'
  };

  const badgeClass = map[status] || 'badge-neutral';

  return `<span class="badge ${badgeClass}">${status || 'Unknown'}</span>`;
}

function initPage(pageTitle) {
  if (!checkAuth()) return;

  renderNavbar();
  renderSidebar();

  if (pageTitle) {
    const titleEl = document.getElementById('pageTitle');

    if (titleEl) titleEl.textContent = pageTitle;

    document.title = `${pageTitle} | ExamPortal`;
  }

  setupDeleteConfirm();
}

function setupSearch(inputId, callback) {
  const input = document.getElementById(inputId);
  if (!input) return;

  let timeout;

  input.addEventListener('input', e => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback(e.target.value);
    }, 300);
  });
}

function setupFilter(selectId, callback) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.addEventListener('change', e => {
    callback(e.target.value);
  });
}

function sortTable(data, key, direction) {
  return [...data].sort((a, b) => {
    const aVal = a[key] || '';
    const bVal = b[key] || '';

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
  });
}

function paginate(data, page, perPage = 10) {
  const start = (page - 1) * perPage;

  return {
    items: data.slice(start, start + perPage),
    total: data.length,
    pages: Math.ceil(data.length / perPage),
    page,
    perPage
  };
}

function renderPagination(containerId, currentPage, totalPages, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  html += `
    <button ${currentPage === 1 ? 'disabled' : ''} onclick="${callback.name}(${currentPage - 1})">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      html += `
        <button class="${i === currentPage ? 'active' : ''}" onclick="${callback.name}(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span style="padding:0 8px;color:var(--text-muted)">...</span>`;
    }
  }

  html += `
    <button ${currentPage === totalPages ? 'disabled' : ''} onclick="${callback.name}(${currentPage + 1})">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  container.innerHTML = html;
}

function renderEmptyState(containerId, icon, title, message, actionHtml = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <i class="fas ${icon}"></i>
      </div>
      <h3>${title}</h3>
      <p>${message}</p>
      ${actionHtml}
    </div>
  `;
}