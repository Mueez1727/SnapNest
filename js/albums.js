// albums.js
document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle");
  
  if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
          document.body.classList.toggle("dark-theme");

          // Save theme preference
          const theme = document.body.classList.contains("dark-theme") ? "dark" : "light";
          localStorage.setItem("theme", theme);
      });
  } else {
      console.warn("Theme toggle button not found!");
  }

  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
  }
  loadAlbums();
});

  
  const albumsContainer = document.getElementById('albumsContainer');
  const createAlbumBtn = document.getElementById('createAlbumBtn');
  const addNewAlbum = document.getElementById('addNewAlbum');
  const createAlbumCentered = document.getElementById('createAlbumCentered');
  const mediaUploader = document.getElementById('mediaUploader');
  
  let albums = []; // Local album list
  let selectedAlbum = null; // For uploading media
  
  createAlbumBtn.addEventListener('click', openCreateModal);
  addNewAlbum.addEventListener('click', openCreateModal);
  
  // Load albums from server
  function loadAlbums() {
    fetch('php/get_albums.php')
      .then(response => response.json())
      .then(data => {
        albums = data || [];
        renderAlbums();
      })
      .catch(error => console.error('Error loading albums:', error));
  }
  
  // Render albums in grid
  function renderAlbums() {
    albumsContainer.innerHTML = '';
  
    if (albums.length === 0) {
      createAlbumCentered.style.display = 'block';
      addNewAlbum.style.display = 'none';
      return;
    } else {
      createAlbumCentered.style.display = 'none';
      addNewAlbum.style.display = 'flex';
    }
  
    albums.forEach((album, index) => {
      const albumCard = createAlbumCard(album);
      albumsContainer.appendChild(albumCard);
    });
  
    // Add the 'Add New Album' card
    albumsContainer.appendChild(addNewAlbum);
  }
  
  // Create album card element
  function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.innerHTML = `
      <div class="album-thumbnail">
        <img src="assets/default-thumbnail.jpg" alt="Album Thumbnail">
      </div>
      <div class="album-info">
        <div class="album-name-date">
          <span class="album-name">${album.name}</span>
          <span class="album-date">${album.creationDate}</span>
        </div>
        <div class="media-counts">📷 ${album.photoCount} | 🎥 ${album.videoCount}</div>
      </div>
    `;
  
    // When clicked → upload media
    card.addEventListener('click', function () {
      selectedAlbum = album.name;
      mediaUploader.click();
    });
  
    return card;
  }
  
  // Open create album modal
  function openCreateModal() {
    document.getElementById('createModal').style.display = 'flex';
  }
  
  // Submit new album
  function submitNewAlbum() {
    const albumNameInput = document.getElementById('newAlbumName');
    const albumName = albumNameInput.value.trim();
    if (!albumName) {
      Swal.fire('Please enter album name');
      return;
    }
  
    fetch('php/save_album.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: albumName })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          closeModal('createModal');
            loadAlbums();  // reload albums
        } else {
          Swal.fire('Album already exists!');
        }
      })
      .catch(error => console.error('Error saving album:', error));
  }
  
  // Upload media to selected album
  mediaUploader.addEventListener('change', function () {
    const files = Array.from(mediaUploader.files);
    if (files.length === 0) return;
  
    const formData = new FormData();
    formData.append('album', selectedAlbum);
    files.forEach(file => {
      formData.append('media[]', file);
    });
  
    fetch('php/upload_media.php', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          Swal.fire('Uploaded successfully!');
          loadAlbums(); // Refresh albums
        } else {
          Swal.fire('Upload failed.');
        }
      })
      .catch(error => console.error('Error uploading media:', error));
  });
  
  // Close modal
  function closeModal(id) {
    document.getElementById(id).style.display = 'none';
  }
