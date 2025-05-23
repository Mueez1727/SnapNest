// albums.js

document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle");

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
      const theme = document.body.classList.contains("dark-theme") ? "dark" : "light";
      localStorage.setItem("theme", theme);
    });
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }

  const sortSelect = document.getElementById("sort-albums");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      renderAlbums(albumSearch.value.trim().toLowerCase());
    });
  }

  loadAlbums();
});

const albumsContainer = document.getElementById("albumsContainer");
const createAlbumBtn = document.getElementById("createAlbumBtn");
const addNewAlbum = document.getElementById("addNewAlbum");
const createAlbumCentered = document.getElementById("createAlbumCentered");
const mediaUploader = document.getElementById("mediaUploader");
const albumSearch = document.getElementById("albumSearch");

if (albumSearch) {
  albumSearch.addEventListener("input", () => {
    const q = albumSearch.value.trim().toLowerCase();
    renderAlbums(q);
  });
}

let albums = [];
let selectedAlbum = null;

createAlbumBtn.addEventListener("click", openCreateModal);
addNewAlbum.addEventListener("click", openCreateModal);

function loadAlbums() {
  fetch("php/get_albums.php")
    .then((response) => response.json())
    .then((data) => {
      albums = data || [];
      renderAlbums();
    })
    .catch((error) => console.error("Error loading albums:", error));
}

function renderAlbums(query = "") {
  albumsContainer.innerHTML = "";

  const sortBy = document.getElementById("sort-albums")?.value || "name";

 let list = query
  ? albums.filter(a => a.name.toLowerCase().includes(query))
  : [...albums];

if (sortBy === "a-z") {
  list.sort((a, b) => a.name.localeCompare(b.name));
} else if (sortBy === "z-a") {
  list.sort((a, b) => b.name.localeCompare(a.name));
} else if (sortBy === "latest") {
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
} else if (sortBy === "oldest") {
  list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}


  const isInitialEmpty = albums.length === 0;
  const isFilteredEmpty = query && list.length === 0;

  if (isInitialEmpty && !query) {
    createAlbumCentered.style.display = "block";
    addNewAlbum.style.display = "none";
    return;
  }

  if (isFilteredEmpty) {
    createAlbumCentered.style.display = "none";
    addNewAlbum.style.display = "none";
    const msg = document.createElement("p");
    msg.textContent = "No matching albums.";
    msg.className = "no-match";
    albumsContainer.appendChild(msg);
    return;
  }

  createAlbumCentered.style.display = "none";
  addNewAlbum.style.display = "flex";

  list.forEach(album => {
    albumsContainer.appendChild(createAlbumCard(album));
  });

  albumsContainer.appendChild(addNewAlbum);
}

function formatDate(datetimeString) {
  const date = new Date(datetimeString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function createAlbumCard(album) {
  const card = document.createElement("div");
  card.className = "album-card";

  const thumbSrc = album.thumbnail ? album.thumbnail : "assets/default-thumbnail.jpg";
  const thumbExt = thumbSrc.split(".").pop().toLowerCase();
  const isVideo = ["mp4", "mov", "avi", "mkv"].includes(thumbExt);

  const thumbHTML = isVideo
    ? `<video src="${thumbSrc}" muted autoplay loop></video>`
    : `<img src="${thumbSrc}" alt="Album Thumbnail">`;

  card.innerHTML = `
    <div class="album-thumbnail">
      ${thumbHTML}
      <div class="album-menu">
        <button class="menu-btn" onclick="toggleMenu(this)">⋮</button>
        <div class="menu-options" style="display:none;">
          <button onclick="openRenameModal('${album.name}')">Rename</button>
          <button onclick="openDeleteModal('${album.name}')">Delete</button>
        </div>
      </div>
      <div class="album-footer">
        <span class="album-name">${album.name}</span>
        <span class="album-date">
          ${album.latestActivity ? formatDate(album.latestActivity) : "No activity yet"}
        </span>
      </div>
    </div>
    <div class="media-counts">
      📷 ${album.photos || 0} &nbsp;|&nbsp; 🎥 ${album.videos || 0}
    </div>
  `;

  card.addEventListener("click", (e) => {
    if (e.target.closest(".album-menu")) return;
    selectedAlbum = album.name;
    const total = (album.photos || 0) + (album.videos || 0);
    if (total === 0) {
      mediaUploader.click();
    } else {
      window.location.href = `album-detail.html?album=${encodeURIComponent(album.name)}`;
    }
  });

  return card;
}

function toggleMenu(button) {
  const menu = button.nextElementSibling;
  const allMenus = document.querySelectorAll(".menu-options");
  allMenus.forEach(m => { if (m !== menu) m.style.display = "none"; });
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function openRenameModal(albumName) {
  document.getElementById("renameInput").value = albumName;
  document.getElementById("renameModal").style.display = "flex";
  document.getElementById("modalOverlay").style.display = "block";
  selectedAlbum = albumName;
}

function openDeleteModal(albumName) {
  document.getElementById("deleteModal").style.display = "flex";
  document.getElementById("modalOverlay").style.display = "block";
  selectedAlbum = albumName;
}

function submitRename() {
  showSpinner("rename");
  const newName = document.getElementById("renameInput").value.trim();
  if (!newName || newName === selectedAlbum) {
    hideSpinner("rename");
    return;
  }

  fetch("php/rename_album.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldName: selectedAlbum, newName }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideSpinner("rename");
      if (data.success) {
        closeModal("renameModal");
        loadAlbums();
      } else {
        Swal.fire("Rename failed: " + data.message);
      }
    })
    .catch((err) => {
      hideSpinner("rename");
      console.error("Rename error:", err);
    });
}

function confirmDelete() {
  showSpinner("delete");
  fetch("php/delete_album.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: selectedAlbum }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideSpinner("delete");
      if (data.success) {
        closeModal("deleteModal");
        loadAlbums();
      } else {
        Swal.fire("Delete failed: " + data.message);
      }
    })
    .catch((err) => {
      hideSpinner("delete");
      console.error("Delete error:", err);
    });
}

function openCreateModal() {
  document.getElementById("createModal").style.display = "flex";
  document.getElementById("modalOverlay").style.display = "block";
}

function submitNewAlbum() {
  const albumNameInput = document.getElementById("newAlbumName");
  const albumName = albumNameInput.value.trim();
  if (!albumName) {
    Swal.fire("Please enter album name");
    return;
  }

  showSpinner("create");

  fetch("php/save_album.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: albumName }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideSpinner("create");
      if (data.success) {
        closeModal("createModal");
        loadAlbums();
      } else {
        Swal.fire("Album already exists!");
      }
    })
    .catch((err) => {
      hideSpinner("create");
      console.error("Error saving album:", err);
    });
}

mediaUploader.addEventListener("change", () => {
  const files = Array.from(mediaUploader.files);
  if (files.length === 0) return;

  const formData = new FormData();
  formData.append("album", selectedAlbum);
  files.forEach(file => formData.append("media[]", file));

  fetch("php/upload_media.php", {
    method: "POST",
    body: formData,
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        Swal.fire("Uploaded successfully!");
        loadAlbums();
      } else {
        Swal.fire("Upload failed.");
      }
    })
    .catch(err => console.error("Error uploading media:", err));
});

function showSpinner(modalId) {
  const spinner = document.getElementById(`${modalId}Spinner`);
  if (spinner) spinner.style.display = "block";
}

function hideSpinner(modalId) {
  const spinner = document.getElementById(`${modalId}Spinner`);
  if (spinner) spinner.style.display = "none";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
  document.getElementById("modalOverlay").style.display = "none";
}
