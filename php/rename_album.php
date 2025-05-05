<?php
$data = json_decode(file_get_contents("php://input"), true);
$oldName = trim($data['oldName']);
$newName = trim($data['newName']);

$albumsFile = '../data/albums.json';
$albumsDir = '../albums/';

if (!$oldName || !$newName || $oldName === $newName) {
    echo json_encode(['success' => false, 'message' => 'Invalid names']);
    exit;
}

// Read existing albums
$albums = file_exists($albumsFile) ? json_decode(file_get_contents($albumsFile), true) : [];

// Check for duplicate
foreach ($albums as $album) {
    if (strtolower($album['name']) === strtolower($newName)) {
        echo json_encode(['success' => false, 'message' => 'Album with this name already exists']);
        exit;
    }
}

$found = false;
foreach ($albums as &$album) {
    if ($album['name'] === $oldName) {
        $album['name'] = $newName;
        $found = true;
        break;
    }
}

if (!$found) {
    echo json_encode(['success' => false, 'message' => 'Album not found']);
    exit;
}

// Rename the folder
$oldPath = $albumsDir . $oldName;
$newPath = $albumsDir . $newName;

if (is_dir($oldPath)) {
    rename($oldPath, $newPath);
}

// Save updated albums.json
file_put_contents($albumsFile, json_encode($albums, JSON_PRETTY_PRINT));

echo json_encode(['success' => true]);
?>
