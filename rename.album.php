<?php
header('Content-Type: application/json');

$albumsDir = 'albums/';
$oldName = $_POST['oldName'] ?? '';
$newName = $_POST['newName'] ?? '';

if (!$oldName || !$newName) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

$oldPath = $albumsDir . $oldName;
$newPath = $albumsDir . $newName;

if (!is_dir($oldPath)) {
    echo json_encode(['success' => false, 'message' => 'Album does not exist']);
    exit;
}

if (file_exists($newPath)) {
    echo json_encode(['success' => false, 'message' => 'New album name already exists']);
    exit;
}

if (rename($oldPath, $newPath)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to rename album']);
}
?>
