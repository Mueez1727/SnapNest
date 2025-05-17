document.addEventListener("DOMContentLoaded", () => {
  const getNote = (album, file) =>
    localStorage.getItem(`note_${album}_${file}`) || "";

  const saveNote = (album, file, text) =>
    localStorage.setItem(`note_${album}_${file}`, text);

  const urlParams = new URLSearchParams(window.location.search);
  const albumName = urlParams.get("album");
  if (!albumName) {
    alert("Album not specified!");
    return;
  }
  document.getElementById("albumTitle").textContent = albumName;

  const mediaGrid     = document.getElementById("mediaGrid");
  const mediaUploader = document.getElementById("mediaUploader");
  const uploadProgress = document.getElementById("uploadProgress");

  const modal         = document.getElementById("mediaModal");
  const modalPreview  = document.getElementById("modalPreview");
  const modalClose    = document.getElementById("modalCloseIcon");
  const noteInput     = document.getElementById("mediaNote");
  const saveNoteBtn   = document.getElementById("saveNoteBtn");
  const deleteBtn     = document.getElementById("deleteMediaBtn");

  function loadMedia() {
    fetch(`php/get_album_media.php?album=${encodeURIComponent(albumName)}`)
      .then(r => r.json())
      .then(renderMediaGrid)
      .catch(() => Swal.fire("Error", "Failed to load media", "error"));
  }

  function renderMediaGrid(files) {
    mediaGrid.innerHTML = "";

    files.forEach(file => {
      const ext = file.split(".").pop().toLowerCase();
      if (!["jpg", "jpeg", "png", "gif", "mp4", "mov", "avi", "mkv"].includes(ext))
        return;

      const item = document.createElement("div");
      item.className = "media-item";
      const media = document.createElement(
        ["jpg", "jpeg", "png", "gif"].includes(ext) ? "img" : "video"
      );

      Object.assign(media, {
        src: `albums/${albumName}/${file}`,
        alt: file,
        controls: false,
        muted: true,
        loop: true,
        autoplay: true
      });

      item.appendChild(media);
      item.style.transition = "transform .3s";
      item.onmouseenter = () => (item.style.transform = "scale(1.05)");
      item.onmouseleave = () => (item.style.transform = "scale(1)");

      item.onclick = () => {
        modalPreview.innerHTML = "";
        const big = media.cloneNode(true);
        big.controls = true;
        big.muted = false;
        modalPreview.appendChild(big);

        const stored = getNote(albumName, file);
        noteInput.value = stored;
        saveNoteBtn.style.display = stored ? "block" : "none";
        saveNoteBtn.disabled = !stored;
        saveNoteBtn.dataset.filename = file;
        deleteBtn.dataset.filename = file;

        modal.style.display = "flex";
      };

      mediaGrid.appendChild(item);
    });

    const addBox = document.createElement("div");
    addBox.className = "upload-more";
    addBox.textContent = "Upload More Media";
    addBox.style.transition = "transform .3s";
    addBox.onmouseenter = () => (addBox.style.transform = "scale(1.05)");
    addBox.onmouseleave = () => (addBox.style.transform = "scale(1)");
    addBox.onclick = () => mediaUploader.click();
    mediaGrid.appendChild(addBox);
  }

  modalClose.onclick = () => {
    modal.style.display = "none";
    noteInput.value = "";
    saveNoteBtn.style.display = "none";
    saveNoteBtn.disabled = true;
  };

  noteInput.oninput = () => {
    const hasText = noteInput.value.trim().length > 0;
    saveNoteBtn.style.display = hasText ? "block" : "none";
    saveNoteBtn.disabled = !hasText;
  };

  saveNoteBtn.onclick = () => {
    const text = noteInput.value.trim();
    const file = saveNoteBtn.dataset.filename;
    if (!text) return;

    saveNote(albumName, file, text);
    Swal.fire("Note saved!", "", "success");
  };

  deleteBtn.onclick = () => {
    const filename = deleteBtn.dataset.filename;

    Swal.fire({
      title: "Are you sure?",
      text: "This media will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!"
    }).then(res => {
      if (!res.isConfirmed) return;

      fetch("php/delete_media.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ album: albumName, file: filename })
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            Swal.fire("Deleted!", "Media removed.", "success");
            modal.style.display = "none";
            loadMedia();
          } else Swal.fire("Error", "Failed to delete media.", "error");
        })
        .catch(() => Swal.fire("Error", "Deletion failed.", "error"));
    });
  };

  mediaUploader.addEventListener("change", () => {
    const files = mediaUploader.files;
    if (!files.length) return;

    const formData = new FormData();
    formData.append("album", albumName);

    for (let i = 0; i < files.length; i++) {
      formData.append("media[]", files[i]);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "php/upload_media.php", true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        uploadProgress.style.display = "block";
        uploadProgress.value = percent;
      }
    };

    xhr.onload = () => {
      uploadProgress.style.display = "none";
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          Swal.fire("Uploaded!", "Media uploaded successfully.", "success");
          mediaUploader.value = ""; // reset file input
          loadMedia();
        } else {
          Swal.fire("Error", "Upload failed.", "error");
        }
      } else {
        Swal.fire("Error", "Server error during upload.", "error");
      }
    };

    xhr.onerror = () => {
      uploadProgress.style.display = "none";
      Swal.fire("Error", "Failed to upload media.", "error");
    };

    xhr.send(formData);
  });

  loadMedia();
});
