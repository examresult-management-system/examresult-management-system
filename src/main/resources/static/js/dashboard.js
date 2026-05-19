// ============================================
// Dashboard.js — Dashboard logic for all roles
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();
  if (page === 'admin-dashboard.html') {
    initAdminDashboard();
  } else if (page === 'student-dashboard.html') {
    initStudentDashboard();
  } else if (page === 'lecturer-dashboard.html') {
    initLecturerDashboard();
  }
});

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

async function safeLoad(loader, fallback = []) {
  try {
    const value = await loader();
    return Array.isArray(value) ? value : fallback;
  } catch (error) {
    console.warn('Dashboard data load skipped:', error.message || error);
    return fallback;
  }
}

function safeSetText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function examStatus(exam) {
  const raw = String(exam?.status || '').toLowerCase();
  if (raw === 'upcoming' || raw === 'scheduled') return 'Upcoming';
  if (raw === 'completed' || raw === 'finished') return 'Completed';
  return exam?.status || 'Upcoming';
}

function examTitle(exam) {
  return exam?.title || exam?.subject || exam?.moduleName || 'Untitled Exam';
}

function examDateValue(exam) {
  return exam?.date || exam?.examDate || null;
}

function examTimeValue(exam) {
  return exam?.time || exam?.examTime || '';
}

function examDurationValue(exam) {
  if (exam?.duration == null || exam.duration === '') return '';
  const n = Number(exam.duration);
  return Number.isFinite(n) ? `${n} hour${n === 1 ? '' : 's'}` : String(exam.duration);
}

function formatExamDate(dateValue) {
  const d = dateValue ? new Date(dateValue) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

// ---- Admin Dashboard ----
function initAdminDashboard() {
  initPage('Dashboard');
  loadAdminDashboard();
}

async function loadAdminDashboard() {
  showSpinner();
  try {
    const [students, lecturers, courses, exams, faculties] = await Promise.all([
      safeLoad(getStudents),
      safeLoad(getLecturers),
      safeLoad(getCourses),
      safeLoad(getExams),
      safeLoad(getFaculties),
    ]);

    safeSetText('statStudents', formatNumber(students.length));
    safeSetText('statLecturers', formatNumber(lecturers.length));
    safeSetText('statCourses', formatNumber(courses.length));
    safeSetText('statExams', formatNumber(exams.filter(e => examStatus(e) === 'Upcoming').length));

    const user = currentUser();
    safeSetText('welcomeName', user.name || 'Admin');

    renderEnrollmentChart(students, faculties);
    renderActivityFeed(students, exams);
    renderUpcomingExams(exams);
    renderRecentStudents(students);
  } catch (err) {
    showToast('Failed to load dashboard data', 'error');
  } finally {
    hideSpinner();
  }
}

// ---- Student Dashboard ----
function initStudentDashboard() {
  initPage('Dashboard');
  loadStudentDashboard();
}

async function loadStudentDashboard() {
  showSpinner();
  try {
    const [examsData, results, announcements] = await Promise.all([
      safeLoad(getExams),
      safeLoad(getResults),
      safeLoad(getAnnouncements),
    ]);

    const upcoming = examsData.filter(e => examStatus(e) === 'Upcoming');
    const graded = results.filter(r => String(r.status || '').toLowerCase() === 'graded');
    const avgScore = graded.length > 0 ? Math.round(graded.reduce((s, r) => s + (Number(r.score ?? r.marks) || 0), 0) / graded.length) : 0;

    safeSetText('statMyExams', formatNumber(examsData.length));
    safeSetText('statAvgScore', avgScore + '%');
    safeSetText('statUpcoming', formatNumber(upcoming.length));
    safeSetText('statAnnouncements', formatNumber(announcements.length));

    const user = currentUser();
    safeSetText('welcomeName', user.name || 'Student');

    renderUpcomingExamsList(upcoming);
    renderRecentResults(results);
    renderRecentAnnouncements(announcements);
  } catch (err) {
    showToast('Failed to load dashboard data', 'error');
  } finally {
    hideSpinner();
  }
}

// ---- Lecturer Dashboard ----
function initLecturerDashboard() {
  initPage('Dashboard');
  loadLecturerDashboard();
}

async function loadLecturerDashboard() {
  showSpinner();

  try {
    const [examsData, results, students] = await Promise.all([
      safeLoad(getExams),
      safeLoad(getResults),
      safeLoad(getStudents),
    ]);

    const passedResults = results.filter(r => {
      const status = String(r.status || "").toLowerCase();
      const grade = String(r.grade || "").toUpperCase();

      return status === "pass" || grade === "A" || grade === "B" || grade === "C" || grade === "D";
    });

    const passRate = results.length > 0
        ? Math.round((passedResults.length / results.length) * 100)
        : 85;

    const statModules = document.getElementById("statModules");
    const statExams = document.getElementById("statExams");
    const statStudents = document.getElementById("statStudents");
    const statPassRate = document.getElementById("statPassRate");
    const welcomeName = document.getElementById("welcomeName");

    if (statModules) statModules.textContent = "5";
    if (statExams) statExams.textContent = formatNumber(examsData.length);
    if (statStudents) statStudents.textContent = formatNumber(students.length);
    if (statPassRate) statPassRate.textContent = passRate + "%";

    const user = currentUser();

    if (welcomeName) {
      welcomeName.textContent = user.name || "Lecturer";
    }

  } catch (err) {
    console.error(err);
  } finally {
    hideSpinner();
  }
}

// ---- Enrollment Chart (Canvas) ----
function renderEnrollmentChart(students, faculties) {
  const canvas = document.getElementById('enrollmentChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  faculties = safeArray(faculties);
  students = safeArray(students);

  if (faculties.length === 0) {
    const legend = document.getElementById('enrollmentLegend');
    if (legend) legend.innerHTML = '<span style="color:var(--text-muted)">No faculty data available</span>';
    return;
  }

  // Count students per faculty
  const counts = {};
  faculties.forEach(f => counts[f.name] = 0);
  students.forEach(s => { if (counts[s.faculty] !== undefined) counts[s.faculty]++; });

  const labels = faculties.map(f => String(f.name || '').replace('Faculty of ', ''));
  const data = faculties.map(f => counts[f.name] || 0);
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#06b6d4'];

  const maxVal = Math.max(...data, 1);
  const chartHeight = rect.height - 60;
  const barWidth = Math.min(60, (rect.width - 80) / data.length - 20);
  const startX = (rect.width - data.length * (barWidth + 20)) / 2 + 10;

  data.forEach((val, i) => {
    const barHeight = (val / maxVal) * chartHeight;
    const x = startX + i * (barWidth + 20);
    const y = rect.height - barHeight - 30;

    // Bar
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
    ctx.fill();

    // Value label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(val, x + barWidth / 2, y - 8);

    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText(labels[i], x + barWidth / 2, rect.height - 8);
  });

  // Legend
  const legend = document.getElementById('enrollmentLegend');
  if (legend) {
    legend.innerHTML = faculties.map((f, i) => `
      <div class="chart-legend-item">
        <div class="chart-legend-dot" style="background:${colors[i % colors.length]}"></div>
        <span>${f.name}</span>
      </div>
    `).join('');
  }
}

// ---- Activity Feed ----
function renderActivityFeed(students, exams) {
  const list = document.getElementById('activityList');
  if (!list) return;

  const activities = [
    { type: 'add', text: `New student <strong>${students[0]?.name || 'John'}</strong> enrolled in ${students[0]?.course || 'Computer Science'}`, time: '10 minutes ago' },
    { type: 'edit', text: `Exam <strong>${examTitle(exams[0] || {})}</strong> schedule updated`, time: '1 hour ago' },
    { type: 'view', text: `<strong>${exams.length || 0}</strong> students viewed their results`, time: '2 hours ago' },
    { type: 'add', text: `New course <strong>Advanced AI</strong> added to curriculum`, time: '3 hours ago' },
    { type: 'delete', text: `Module <strong>Old CS Module</strong> was removed`, time: '5 hours ago' },
    { type: 'edit', text: `Timetable updated for <strong>Spring 2026</strong>`, time: '1 day ago' },
    { type: 'add', text: `Announcement posted: <strong>Exam Schedule Released</strong>`, time: '1 day ago' },
  ];

  list.innerHTML = activities.map(a => `
    <li class="activity-item">
      <div class="activity-icon ${a.type}"><i class="fas fa-${a.type === 'add' ? 'plus' : a.type === 'edit' ? 'pen' : a.type === 'delete' ? 'trash' : 'eye'}"></i></div>
      <div class="activity-content">
        <p>${a.text}</p>
        <span class="activity-time">${a.time}</span>
      </div>
    </li>
  `).join('');
}

// ---- Upcoming Exams ----
function renderUpcomingExams(exams) {
  const list = document.getElementById('upcomingExamsList');
  if (!list) return;
  const upcoming = exams.filter(e => examStatus(e) === 'Upcoming').slice(0, 4);

  if (upcoming.length === 0) {
    list.innerHTML = '<li class="empty-state" style="padding:20px"><p>No upcoming exams</p></li>';
    return;
  }

  list.innerHTML = upcoming.map(e => {
    const d = formatExamDate(examDateValue(e));
    return `
      <li class="upcoming-item">
        <div class="upcoming-date">
          <span class="day">${d.getDate()}</span>
          <span class="month">${d.toLocaleString('en', {month:'short'})}</span>
        </div>
        <div class="upcoming-info">
          <h4>${examTitle(e)}</h4>
          <p><i class="fas fa-clock"></i> ${examTimeValue(e)} &bull; ${examDurationValue(e)}</p>
        </div>
      </li>
    `;
  }).join('');
}

// ---- Recent Students ----
function renderRecentStudents(students) {
  const tbody = document.getElementById('recentStudentsBody');
  if (!tbody) return;
  const recent = students.slice(0, 5);

  tbody.innerHTML = recent.map(s => `
    <tr>
      <td><strong>${s.name}</strong><br><small style="color:var(--text-muted)">${s.email}</small></td>
      <td>${s.course}</td>
      <td>${s.faculty}</td>
      <td>${getStatusBadge(s.status)}</td>
    </tr>
  `).join('');
}

// ---- Student Dashboard Renders ----
function renderUpcomingExamsList(exams) {
  const list = document.getElementById('upcomingExamsList');
  if (!list) return;
  if (exams.length === 0) {
    renderEmptyState('upcomingExamsContainer', 'fa-calendar', 'No Upcoming Exams', 'You have no upcoming exams scheduled.');
    return;
  }
  list.innerHTML = exams.slice(0, 5).map(e => {
    const d = formatExamDate(examDateValue(e));
    return `
      <li class="upcoming-item">
        <div class="upcoming-date">
          <span class="day">${d.getDate()}</span>
          <span class="month">${d.toLocaleString('en', {month:'short'})}</span>
        </div>
        <div class="upcoming-info">
          <h4>${examTitle(e)}</h4>
          <p><i class="fas fa-clock"></i> ${examTimeValue(e)} &bull; ${examDurationValue(e)}</p>
        </div>
        <a href="exam-submit.html?id=${e.id}" class="btn btn-primary btn-sm">Start</a>
      </li>
    `;
  }).join('');
}

function renderRecentResults(results) {
  const tbody = document.getElementById('recentResultsBody');
  if (!tbody) return;
  const recent = results.filter(r => String(r.status || '').toLowerCase() === 'graded').slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding:20px;color:var(--text-muted)">No graded results yet</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(r => `
    <tr>
      <td><strong>${r.exam || r.examTitle || r.moduleName || '-'}</strong></td>
      <td>${(r.score ?? r.marks) != null ? (r.score ?? r.marks) + '%' : '-'}</td>
      <td><span class="${getGradeClass(r.grade)}">${r.grade}</span></td>
      <td>${getStatusBadge(r.status)}</td>
    </tr>
  `).join('');
}

function renderRecentAnnouncements(announcements) {
  const list = document.getElementById('recentAnnouncementsList');
  if (!list) return;
  const recent = announcements.slice(0, 3);

  list.innerHTML = recent.map(a => `
    <div class="announcement-card">
      <h4>${a.title}</h4>
      <p>${a.content}</p>
      <div class="announcement-meta">
        <span><i class="fas fa-user"></i> ${a.author}</span>
        <span><i class="fas fa-clock"></i> ${timeAgo(a.date)}</span>
      </div>
    </div>
  `).join('');
}

// ---- Lecturer Dashboard Renders ----
function renderMyExamsList(exams) {
  const list = document.getElementById('myExamsList');
  if (!list) return;
  if (exams.length === 0) {
    list.innerHTML = '<li class="empty-state" style="padding:20px"><p>No exams created yet</p></li>';
    return;
  }
  list.innerHTML = exams.slice(0, 5).map(e => {
    const d = formatExamDate(examDateValue(e));
    return `
      <li class="upcoming-item">
        <div class="upcoming-date">
          <span class="day">${d.getDate()}</span>
          <span class="month">${d.toLocaleString('en', {month:'short'})}</span>
        </div>
        <div class="upcoming-info">
          <h4>${examTitle(e)}</h4>
          <p>${e.course || e.moduleCode || ''} &bull; ${examStatus(e)}</p>
        </div>
        ${examStatus(e) === 'Upcoming' ? getStatusBadge('Upcoming') : getStatusBadge('Completed')}
      </li>
    `;
  }).join('');
}

function renderRecentSubmissions(results) {
  const tbody = document.getElementById('recentSubmissionsBody');
  if (!tbody) return;
  const pending = results.filter(r => String(r.status || '').toLowerCase() === 'pending').slice(0, 5);

  if (pending.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding:20px;color:var(--text-muted)">No pending submissions</td></tr>';
    return;
  }

  tbody.innerHTML = pending.map(r => `
    <tr>
      <td><strong>${r.student || r.studentName || '-'}</strong></td>
      <td>${r.exam || r.examTitle || r.moduleName || '-'}</td>
      <td>${getStatusBadge(r.status)}</td>
      <td><a href="results.html?exam=${r.exam || r.examTitle || r.moduleName || '-'}" class="btn btn-primary btn-sm">Grade</a></td>
    </tr>
  `).join('');
}
