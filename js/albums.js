// Load theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.classList.add(savedTheme);
  } else {
    document.body.classList.add('light-theme'); // default
  }

  fetchAlbumsFromServer(); // Load albums
});

function fetchAlbumsFromServer() {
  fetch('get_albums.php')
    .then(response => response.json())
    .then(data => {
      albums = data;
      renderAlbums();
    })
    .catch(error => console.error("Error loading albums:", error));
}

// Album State
let albums = [];
let selectedAlbumIndex = null;

// DOM Elements
const createAlbumBtn = document.getElementById("createAlbumBtn");
const albumsContainer = document.getElementById("albumsContainer");
const createAlbumCentered = document.getElementById("createAlbumCentered");
const addNewAlbumBox = document.getElementById("addNewAlbum");
const albumTemplate = document.getElementById("albumTemplate");

const createModal = document.getElementById("createModal");
const renameModal = document.getElementById("renameModal");
const deleteModal = document.getElementById("deleteModal");

const newAlbumNameInput = document.getElementById("newAlbumName");
const renameInput = document.getElementById("renameInput");
const sortSelect = document.getElementById("sort-albums");

// Render all albums
function renderAlbums() {
  albumsContainer.innerHTML = "";

  if (albums.length === 0) {
    createAlbumCentered.style.display = "flex";
    addNewAlbumBox.style.display = "none";
  } else {
    createAlbumCentered.style.display = "none";

    albums.forEach((album, index) => {
      const clone = albumTemplate.content.cloneNode(true);
      const albumCard = clone.querySelector(".album-card");
      albumCard.addEventListener("click", () => {
        const mediaCount = (album.photos || 0) + (album.videos || 0);
        if (mediaCount === 0) {
          selectedAlbumName = album.name;
          document.getElementById("mediaUploader").click();
        } else {
          // In future: open album view
          alert("Media viewer not implemented yet.");
        }
      });      
      albumCard.dataset.index = index;

      // Metadata for sorting
      albumCard.dataset.name = album.name;
      albumCard.dataset.created = album.createdAt;
      albumCard.dataset.activity = album.latestActivity;

      // Set UI content
      clone.querySelector(".album-name").textContent = album.name;
      clone.querySelector(".album-date").textContent = album.date || new Date(album.createdAt).toLocaleDateString();
      clone.querySelector(".media-counts").textContent = `📷 ${album.photos || 0} | 🎥 ${album.videos || 0}`;

      // 3-dot menu
      const menuIcon = clone.querySelector(".menu-icon span");
      const menuOptions = clone.querySelector(".menu-options");
      menuIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        menuOptions.classList.toggle("show");
      });

      // Rename button
      clone.querySelector(".rename-btn").addEventListener("click", () => {
        selectedAlbumIndex = index;
        renameInput.value = albums[index].name;
        showModal("renameModal");
      });

      // Delete button
      clone.querySelector(".delete-btn").addEventListener("click", () => {
        selectedAlbumIndex = index;
        showModal("deleteModal");
      });

      albumsContainer.appendChild(clone);
    });

    addNewAlbumBox.style.display = "block";
    albumsContainer.appendChild(addNewAlbumBox);
  }
}

// Sort albums by selected criteria
function sortAlbums(criteria) {
  albums.sort((a, b) => {
    if (criteria === "name") {
      return a.name.localeCompare(b.name);
    } else if (criteria === "date") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (criteria === "activity") {
      return new Date(b.latestActivity) - new Date(a.latestActivity);
    }
  });

  renderAlbums();
}

// Modal show/hide
function showModal(modalId) {
  document.getElementById(modalId).style.display = "flex";
}
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Create album
function submitNewAlbum() {
  const name = newAlbumNameInput.value.trim();
  if (name) {
    fetch('create_album.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        newAlbumNameInput.value = "";
        closeModal("createModal");
        fetchAlbumsFromServer(); // Refresh album list
      } else {
        alert(result.message || "Failed to create album.");
      }
    })
    .catch(error => {
      console.error("Error creating album:", error);
      alert("Error creating album.");
    });
  }
}

let selectedAlbumName = null;

document.getElementById("mediaUploader").addEventListener("change", (e) => {
  const files = e.target.files;
  if (files.length === 0 || !selectedAlbumName) return;

  const formData = new FormData();
  formData.append("album", selectedAlbumName);
  for (const file of files) {
    formData.append("media[]", file);
  }

  fetch("upload_media.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Media uploaded successfully!");
      fetchAlbumsFromServer(); // Refresh albums
    } else {
      alert("Upload failed.");
    }
  })
  .catch(err => {
    console.error("Upload error:", err);
    alert("Upload failed.");
  });

  // Reset uploader input
  e.target.value = "";
});


// Rename album (local only)
function submitRename() {
  const newName = renameInput.value.trim();
  if (newName && selectedAlbumIndex !== null) {
    const oldName = albums[selectedAlbumIndex].name;

    fetch('rename_album.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `oldName=${encodeURIComponent(oldName)}&newName=${encodeURIComponent(newName)}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        albums[selectedAlbumIndex].name = newName;
        closeModal("renameModal");
        fetchAlbumsFromServer(); // Refresh from server
      } else {
        alert(data.message || 'Failed to rename album');
      }
    });
  }
}


// Delete album (local only)
function confirmDelete() {
  if (selectedAlbumIndex !== null) {
    const albumName = albums[selectedAlbumIndex].name;

    fetch('delete_album.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `name=${encodeURIComponent(albumName)}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        closeModal("deleteModal");
        fetchAlbumsFromServer(); // Refresh from server
      } else {
        alert(data.message || 'Failed to delete album');
      }
    });
  }
}


// Toggle light/dark theme
function toggleTheme() {
  const body = document.body;
  if (body.classList.contains('light-theme')) {
    body.classList.replace('light-theme', 'dark-theme');
    localStorage.setItem('theme', 'dark-theme');
  } else {
    body.classList.replace('dark-theme', 'light-theme');
    localStorage.setItem('theme', 'light-theme');
  }
}

// Close all 3-dot menus
function closeAllMenus() {
  document.querySelectorAll(".menu-options").forEach(menu => {
    menu.classList.remove("show");
  });
}

// Event Listeners
createAlbumBtn.addEventListener("click", () => showModal("createModal"));
addNewAlbumBox.addEventListener("click", () => showModal("createModal"));
document.addEventListener("click", closeAllMenus);
sortSelect.addEventListener("change", () => sortAlbums(sortSelect.value));

// Prevent menu click from closing
document.querySelectorAll(".menu-options").forEach(menu => {
  menu.addEventListener("click", (e) => e.stopPropagation());
});
