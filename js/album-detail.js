document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const albumName = urlParams.get("album");
  if (!albumName) {
    alert("Album not specified!");
    return;
  }

  document.getElementById("albumTitle").textContent = albumName;

  const mediaGrid = document.getElementById("mediaGrid");
  const mediaUploader = document.getElementById("mediaUploader");

  // Helper: fetch media list from server PHP endpoint
  function loadMedia() {
    fetch(`php/get_album_media.php?album=${encodeURIComponent(albumName)}`)
      .then(res => res.json())
      .then(files => {
        renderMediaGrid(files);
      })
      .catch(err => {
        console.error(err);
        alert("Failed to load media");
      });
  }

  function renderMediaGrid(files) {
    mediaGrid.innerHTML = "";

    files.forEach(file => {
      const ext = file.split('.').pop().toLowerCase();
      const item = document.createElement("div");
      item.className = "media-item";

      if (["jpg","jpeg","png","gif"].includes(ext)) {
        const img = document.createElement("img");
        img.src = `albums/${albumName}/${file}`;
        img.alt = file;
        item.appendChild(img);
      } else if (["mp4","mov","avi","mkv"].includes(ext)) {
        const vid = document.createElement("video");
        vid.src = `albums/${albumName}/${file}`;
        vid.controls = true;
        item.appendChild(vid);
      }

      mediaGrid.appendChild(item);
    });

    // Add Upload More Media box
    const uploadMore = document.createElement("div");
    uploadMore.className = "upload-more";
    uploadMore.textContent = "Upload More Media";
    uploadMore.addEventListener("click", () => {
      mediaUploader.click();
    });
    mediaGrid.appendChild(uploadMore);
  }

  mediaUploader.addEventListener("change", () => {
    const files = Array.from(mediaUploader.files);
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append("album", albumName);
    files.forEach(file => formData.append("media[]", file));

    fetch("php/upload_media.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Uploaded successfully!");
          loadMedia();
          mediaUploader.value = ""; // reset input
        } else {
          alert("Upload failed.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Upload error");
      });
  });

  loadMedia();
});
