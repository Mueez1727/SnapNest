<?php
// Path to the JSON file
$albumsFile = '../data/albums.json';

// Check if file exists and read contents
if (file_exists($albumsFile)) {
    $albumsData = file_get_contents($albumsFile);
    echo $albumsData;
} else {
    // Return an empty array if file doesn't exist
    echo json_encode([]);
}
?>
