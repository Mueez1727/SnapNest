<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$albumName = trim($data['name']);

if (!$albumName) {
    echo json_encode(['success' => false, 'message' => 'Album name is required.']);
    exit;
}

$albumsDir = 'albums/';
$albumPath = $albumsDir . $albumName;

if (!is_dir($albumsDir)) {
    mkdir($albumsDir, 0755, true);
}

if (file_exists($albumPath)) {
    echo json_encode(['success' => false, 'message' => 'Album already exists.']);
    exit;
}

if (mkdir($albumPath, 0755)) {
    echo json_encode(['success' => true, 'message' => 'Album created successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to create album.']);
}
?>
