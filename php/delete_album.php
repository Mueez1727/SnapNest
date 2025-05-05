<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$albumName = trim($data['name']);
$albumPath = '../albums/' . $albumName;

if (!is_dir($albumPath)) {
    echo json_encode(['success' => false, 'message' => 'Album not found']);
    exit;
}

// Delete all files inside the album
$files = glob($albumPath . '/*');
foreach ($files as $file) {
    if (is_file($file)) {
        unlink($file);
    }
}

// Delete the album folder
if (rmdir($albumPath)) {
    // Optional: Update albums.json if you're maintaining a list
    $jsonPath = '../data/albums.json';
    if (file_exists($jsonPath)) {
        $albums = json_decode(file_get_contents($jsonPath), true);
        $albums = array_filter($albums, fn($album) => $album['name'] !== $albumName);
        file_put_contents($jsonPath, json_encode(array_values($albums), JSON_PRETTY_PRINT));
    }

    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete album']);
}
