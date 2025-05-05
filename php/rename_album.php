<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$oldName = trim($data['oldName']);
$newName = trim($data['newName']);

$albumsDir = '../albums/';
$oldPath = $albumsDir . $oldName;
$newPath = $albumsDir . $newName;

if (!is_dir($oldPath)) {
    echo json_encode(['success' => false, 'message' => 'Album not found']);
    exit;
}

if (is_dir($newPath)) {
    echo json_encode(['success' => false, 'message' => 'An album with the new name already exists']);
    exit;
}

if (rename($oldPath, $newPath)) {
    // Optional: Update albums.json if you're maintaining a list
    $jsonPath = '../data/albums.json';
    if (file_exists($jsonPath)) {
        $albums = json_decode(file_get_contents($jsonPath), true);
        foreach ($albums as &$album) {
            if ($album['name'] === $oldName) {
                $album['name'] = $newName;
                break;
            }
        }
        file_put_contents($jsonPath, json_encode($albums, JSON_PRETTY_PRINT));
    }

    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to rename album']);
}
