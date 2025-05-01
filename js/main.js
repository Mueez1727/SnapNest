// main.js
// Navigate to next page
function goToAlbums(event) {
    if (event.target.closest('.navbar')) return;
    window.location.href = "albums.html";
}
