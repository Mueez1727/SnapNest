document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const albumName = params.get("album");
  
    if (!albumName) {
      document.getElementById("albumTitle").textContent = "Album Not Found";
      return;
    }
  
    document.getElementById("albumTitle").textContent = decodeURIComponent(albumName);
  
    fetch(`php/get_album_media.php?album=${encodeURIComponent(albumName)}`)
      .then(res => res.json())
      .then(data => {
        const grid = document.getElementById("mediaGrid");
  
        data.forEach(file => {
          const ext = file.split('.').pop().toLowerCase();
          const item = document.createElement(ext === "mp4" ? "video" : "img");
  
          item.src = `albums/${encodeURIComponent(albumName)}/${file}`;
          if (ext === "mp4") item.controls = true;
  
          grid.appendChild(item);
        });
      })
      .catch(err => console.error("Failed to load media:", err));
  });
  