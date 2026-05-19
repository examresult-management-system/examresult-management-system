let allAnnouncements = [];
let editingAnnouncementId = null;

document.addEventListener("DOMContentLoaded", function () {
  initPage("Announcements");
  setupAnnouncementEvents();
  loadAnnouncements();
});

function canPublishAnnouncements() {
  const role = String(getRole() || "").toUpperCase();
  return role === "LECTURER" || role === "ADMIN";
}

async function loadAnnouncements() {
  showSpinner();

  try {
    allAnnouncements = await getAnnouncements();

    allAnnouncements.sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });

    renderAnnouncements();

  } catch (error) {
    console.error(error);
    showToast("Failed to load announcements", "error");
  } finally {
    hideSpinner();
  }
}

function renderAnnouncements() {
  const container = document.getElementById("announcementsContainer");
  const addBtn = document.getElementById("addAnnouncementBtn");

  if (!container) return;

  if (addBtn) {
    addBtn.style.display = canPublishAnnouncements() ? "inline-flex" : "none";
  }

  if (!allAnnouncements || allAnnouncements.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:60px">
        <div class="empty-state-icon">
          <i class="fas fa-bullhorn"></i>
        </div>
        <h3>No announcements yet</h3>
        <p>Announcements will appear here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = allAnnouncements.map(a => `
    <div class="card" style="margin-bottom:20px">

      <div class="card-header">
        <h3>${escapeHtml(a.title || "")}</h3>

        ${
      a.priority === "High"
          ? `<span class="badge badge-error">High Priority</span>`
          : `<span class="badge badge-neutral">Normal</span>`
  }
      </div>

      <div class="card-body">
        <p style="line-height:1.6;color:var(--text-secondary)">
          ${escapeHtml(a.content || "")}
        </p>

        <div class="announcement-meta">
          <span>
            <i class="fas fa-user"></i>
            ${escapeHtml(a.author || "Lecturer")}
          </span>

          <span>
            <i class="fas fa-clock"></i>
            ${timeAgo(a.date)}
          </span>
        </div>

        ${
      canPublishAnnouncements()
          ? `
              <div class="table-actions" style="margin-top:16px">
                <button class="btn btn-ghost btn-icon btn-sm" onclick="editAnnouncement(${a.id})" title="Edit">
                  <i class="fas fa-pen"></i>
                </button>

                <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteAnnouncementConfirm(${a.id})" title="Delete" style="color:var(--error)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `
          : ""
  }
      </div>

    </div>
  `).join("");
}

function setupAnnouncementEvents() {
  const addBtn = document.getElementById("addAnnouncementBtn");
  const closeBtn = document.getElementById("announcementModalClose");
  const cancelBtn = document.getElementById("announcementCancel");
  const saveBtn = document.getElementById("announcementSave");

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      if (!canPublishAnnouncements()) {
        showToast("Students cannot publish announcements", "error");
        return;
      }

      editingAnnouncementId = null;

      document.getElementById("announcementModalTitle").textContent = "New Announcement";
      document.getElementById("announcementSave").textContent = "Post Announcement";
      document.getElementById("announcementForm").reset();

      openModal("announcementModalOverlay");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      closeModal("announcementModalOverlay");
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      closeModal("announcementModalOverlay");
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", saveAnnouncement);
  }

  setupModalClose("announcementModalOverlay");
}

function editAnnouncement(id) {
  if (!canPublishAnnouncements()) {
    showToast("Students cannot edit announcements", "error");
    return;
  }

  const announcement = allAnnouncements.find(a => Number(a.id) === Number(id));

  if (!announcement) return;

  editingAnnouncementId = id;

  document.getElementById("announcementModalTitle").textContent = "Edit Announcement";
  document.getElementById("announcementSave").textContent = "Update Announcement";

  document.getElementById("annTitle").value = announcement.title || "";
  document.getElementById("annContent").value = announcement.content || "";
  document.getElementById("annPriority").value = announcement.priority || "Normal";

  openModal("announcementModalOverlay");
}

function deleteAnnouncementConfirm(id) {
  if (!canPublishAnnouncements()) {
    showToast("Students cannot delete announcements", "error");
    return;
  }

  confirmDelete(async function () {
    try {
      await deleteAnnouncement(id);

      allAnnouncements = allAnnouncements.filter(a => Number(a.id) !== Number(id));

      renderAnnouncements();

      showToast("Announcement deleted", "success");

    } catch (error) {
      console.error(error);
      showToast("Failed to delete announcement", "error");
    }
  });
}

async function saveAnnouncement() {
  if (!canPublishAnnouncements()) {
    showToast("Students cannot publish announcements", "error");
    return;
  }

  const title = document.getElementById("annTitle").value.trim();
  const content = document.getElementById("annContent").value.trim();
  const priority = document.getElementById("annPriority").value;

  if (!title || !content) {
    showToast("Please fill all fields", "warning");
    return;
  }

  const user = currentUser();

  const data = {
    title: title,
    content: content,
    priority: priority,
    author: user.name || "Lecturer"
  };

  try {
    showSpinner();

    if (editingAnnouncementId) {
      const updated = await updateAnnouncement(editingAnnouncementId, data);

      const index = allAnnouncements.findIndex(a => Number(a.id) === Number(editingAnnouncementId));

      if (index >= 0) {
        allAnnouncements[index] = updated;
      }

      showToast("Announcement updated", "success");

    } else {
      const created = await createAnnouncement(data);

      allAnnouncements.unshift(created);

      showToast("Announcement published", "success");
    }

    closeModal("announcementModalOverlay");

    renderAnnouncements();

  } catch (error) {
    console.error(error);
    showToast("Failed to save announcement", "error");
  } finally {
    hideSpinner();
  }
}

function escapeHtml(value) {
  return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
}