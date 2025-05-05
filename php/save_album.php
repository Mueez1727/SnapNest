<?php
// Read and decode input JSON
$input = json_decode(file_get_contents("php://input"), true);
$name = trim($input['name']);

$albumsFile = '../data/albums.json';
$albumsFolder = '../albums/';

if (!$name) {
    echo json_encode(['success' => false, 'message' => 'Invalid album name']);
    exit;
}

// Load existing albums
$albums = file_exists($albumsFile) ? json_decode(file_get_contents($albumsFile), true) : [];

// Check for duplicate album name
foreach ($albums as $album) {
    if (strtolower($album['name']) === strtolower($name)) {
        echo json_encode(['success' => false, 'message' => 'Album already exists']);
        exit;
    }
}

// Create new album entry
$newAlbum = [
    'name' => $name,
    'creationDate' => date('Y-m-d'),
    'photoCount' => 0,
    'videoCount' => 0
];

// Append and save
$albums[] = $newAlbum;
file_put_contents($albumsFile, json_encode($albums, JSON_PRETTY_PRINT));

// Create album folder if it doesn't exist
$albumPath = $albumsFolder . $name;
if (!is_dir($albumPath)) {
    mkdir($albumPath, 0777, true);
}

echo json_encode(['success' => true]);
?>
