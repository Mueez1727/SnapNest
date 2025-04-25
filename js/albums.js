// Load theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.classList.add(savedTheme);
  } else {
    document.body.classList.add('light-theme'); // default
  }

  fetchAlbumsFromServer(); // Load albums

  const renameBtn = document.getElementById("renameDoneBtn");
  const deleteBtn = document.getElementById("deleteDoneBtn");
  const createAlbumBtn = document.getElementById("createAlbumBtn");
  const addNewAlbumBox = document.getElementById("addNewAlbum");
  const sortSelect = document.getElementById("sort-albums");

  if (renameBtn) renameBtn.addEventListener("click", submitRename);
  if (deleteBtn) deleteBtn.addEventListener("click", confirmDelete);
  if (createAlbumBtn) createAlbumBtn.addEventListener("click", () => showModal("createModal"));
  if (addNewAlbumBox) addNewAlbumBox.addEventListener("click", () => showModal("createModal"));
  if (sortSelect) sortSelect.addEventListener("change", () => sortAlbums(sortSelect.value));
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

const mediaUploader = document.getElementById("mediaUploader");
const noAlbumsMsg = document.getElementById("noAlbumsMsg");

// Render all albums
function renderAlbums() {
  albumsContainer.innerHTML = "";

  if (albums.length === 0) {
    createAlbumCentered.style.display = "flex";
    addNewAlbumBox.style.display = "none";
    noAlbumsMsg.style.display = "block";
  } else {
    createAlbumCentered.style.display = "none";
    noAlbumsMsg.style.display = "none";

    albums.forEach((album, index) => {
      const clone = albumTemplate.content.cloneNode(true);
      const albumCard = clone.querySelector(".album-card");
      albumCard.addEventListener("click", () => {
        const mediaCount = (album.photos || 0) + (album.videos || 0);
        if (mediaCount === 0) {
          selectedAlbumName = album.name;
          document.getElementById("mediaUploader").click();
        } else {
          window.location.href = `album-detail.html?album=${encodeURIComponent(album.name)}`;
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
      const img = clone.querySelector(".album-thumbnail img");
      img.src = album.thumbnail || 'assets/default-thumbnail.jpg';
      // 3-dot menu
      const menuIcon = clone.querySelector(".menu-icon span");
      const menuOptions = clone.querySelector(".menu-options");
      const menuContainer = clone.querySelector(".menu-icon");
      
      menuContainer.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent album card click
        menuOptions.classList.toggle("show");
      });
      
      // Prevent options click from bubbling
      menuOptions.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", (e) => e.stopPropagation());
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

  sortSelect.addEventListener('change', () => {
    const selected = sortSelect.value;
    sortAlbums(selected);
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

        // Show cute animated success popup
        Swal.fire({
          icon: 'success',
          title: 'Album Created!',
          showConfirmButton: false,
          timer: 1500,
          background: '#fefefe',
          color: '#333',
          backdrop: `
            rgba(0,0,123,0.4)
            url("https://sweetalert2.github.io/images/nyan-cat.gif")
            left top
            no-repeat
          `
        });

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: result.message || "Failed to create album."
        });
      }
    })
    .catch(error => {
      console.error("Error creating album:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: "Error creating album."
      });
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
      Swal.fire({
        icon: 'success',
        title: 'Media Uploaded!',
        text: 'Your files have been added to the album.',
        showConfirmButton: false,
        timer: 2000,
        background: '#fff',
        backdrop: `rgba(0,0,0,0.3)`
      });      
      fetchAlbumsFromServer(); // Refresh albums
    } else {
      alert("Upload failed.");
    }
  })
  .catch(err => {
    console.error("Upload error:", err);
  });

  // Reset uploader input
  e.target.value = "";
});


// Rename album (server)
function submitRename() {
  const newName = renameInput.value.trim();
  if (!newName || selectedAlbumIndex === null) return;

  const oldName = albums[selectedAlbumIndex].name;

  fetch('rename_album.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldName, newName })
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      closeModal("renameModal");
      fetchAlbumsFromServer(); // Refresh album list

      Swal.fire({
        icon: 'success',
        title: 'Album Renamed!',
        text: `"${oldName}" is now "${newName}"`,
        showConfirmButton: false,
        timer: 1800
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Rename Failed',
        text: result.message || "Could not rename album."
      });
    }
  })
  .catch(error => {
    console.error("Rename error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: "Something went wrong while renaming the album."
    });
  });
}

// Delete album (server)
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
        Swal.fire('Deleted!', 'Album removed.', 'success');
        fetchAlbumsFromServer();
        closeModal("deleteModal");
      } else {
        Swal.fire('Error', 'Could not delete album.', 'error');
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
document.addEventListener("click", () => {
  document.querySelectorAll(".menu-options.show").forEach(menu => {
    menu.classList.remove("show");
  });
});


// Event Listeners
createAlbumBtn.addEventListener("click", () => showModal("createModal"));
addNewAlbumBox.addEventListener("click", () => showModal("createModal"));
sortSelect.addEventListener("change", () => sortAlbums(sortSelect.value));

// Prevent menu click from closing
document.querySelectorAll(".menu-options").forEach(menu => {
  menu.addEventListener("click", (e) => e.stopPropagation());
});

// ✅ Add this line to hook up the rename Done button
const renameBtn = document.getElementById("renameDoneBtn");
if (renameBtn) {
  renameBtn.addEventListener("click", submitRename);
}
