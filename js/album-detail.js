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

  // Modal elements
  const modal = document.getElementById("mediaModal");
  const modalPreview = document.getElementById("modalPreview");
  const modalCloseIcon = document.getElementById("modalCloseIcon");
  const noteInput = document.getElementById("mediaNote");
  const saveNoteBtn = document.getElementById("saveNoteBtn");
  const deleteBtn = document.getElementById("deleteMediaBtn");

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

      let mediaElement;
      if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
        mediaElement = document.createElement("img");
      } else if (["mp4", "mov", "avi", "mkv"].includes(ext)) {
        mediaElement = document.createElement("video");
        mediaElement.controls = false;
        mediaElement.muted = true;
        mediaElement.loop = true;
        mediaElement.autoplay = true;
      } else {
        return; // Skip unsupported file types
      }

      mediaElement.src = `albums/${albumName}/${file}`;
      mediaElement.alt = file;
      item.appendChild(mediaElement);

      // Hover effect (scale up)
      item.style.transition = "transform 0.3s ease";
      item.addEventListener("mouseenter", () => {
        item.style.transform = "scale(1.05)";
      });
      item.addEventListener("mouseleave", () => {
        item.style.transform = "scale(1)";
      });

      // Modal logic on click
      item.addEventListener("click", () => {
        modalPreview.innerHTML = ""; // Clear before new

        const modalMedia = mediaElement.cloneNode(true);
        modalMedia.controls = true;
        modalMedia.muted = false;
        modalMedia.autoplay = true;
        modalPreview.appendChild(modalMedia);

        // Clear note input on open
        noteInput.value = "";
        saveNoteBtn.style.display = "none";
        saveNoteBtn.disabled = true;

        modal.style.display = "flex";

        // Store filename for deletion
        deleteBtn.dataset.filename = file;
      });

      mediaGrid.appendChild(item);
    });

    // Upload More box
    const uploadMore = document.createElement("div");
    uploadMore.className = "upload-more";
    uploadMore.textContent = "Upload More Media";

    // Hover effect for upload box
    uploadMore.style.transition = "transform 0.3s ease";
    uploadMore.addEventListener("mouseenter", () => {
      uploadMore.style.transform = "scale(1.05)";
    });
    uploadMore.addEventListener("mouseleave", () => {
      uploadMore.style.transform = "scale(1)";
    });

    uploadMore.addEventListener("click", () => mediaUploader.click());
    mediaGrid.appendChild(uploadMore);
  }

  // Modal Close icon (❌)
  modalCloseIcon.addEventListener("click", () => {
    modal.style.display = "none";
    noteInput.value = "";
    saveNoteBtn.style.display = "none";
    saveNoteBtn.disabled = true;
  });

  // Show/hide Done button based on note input
  noteInput.addEventListener("input", () => {
    const hasText = noteInput.value.trim().length > 0;
    saveNoteBtn.style.display = hasText ? "block" : "none";
    saveNoteBtn.disabled = !hasText;
  });

  // Save note button click
  saveNoteBtn.addEventListener("click", () => {
    const note = noteInput.value.trim();
    if (note) {
      console.log("Saving note:", note);
      // TODO: Add AJAX call here to save note on server for this file if desired

      Swal.fire("Note saved!", "", "success");
      modal.style.display = "none";
      noteInput.value = "";
      saveNoteBtn.style.display = "none";
      saveNoteBtn.disabled = true;
    }
  });

  // Delete button click with confirmation using Swal
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const filename = deleteBtn.dataset.filename;

      Swal.fire({
        title: "Are you sure?",
        text: "This media will be deleted permanently.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          fetch("php/delete_media.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ album: albumName, file: filename }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                Swal.fire("Deleted!", "Your media has been deleted.", "success");
                modal.style.display = "none";
                loadMedia();
              } else {
                Swal.fire("Error", "Failed to delete media.", "error");
              }
            })
            .catch(() => {
              Swal.fire("Error", "Something went wrong during deletion.", "error");
            });
        }
      });
    });
  }

  loadMedia();
});
