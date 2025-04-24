<?php
// rename_album.php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $oldName = $_POST['oldName'] ?? '';
    $newName = $_POST['newName'] ?? '';

    $albumsDir = __DIR__ . '/albums'; // adjust folder if needed
    $oldPath = $albumsDir . '/' . $oldName;
    $newPath = $albumsDir . '/' . $newName;

    if (!is_dir($oldPath)) {
        echo json_encode(['success' => false, 'message' => 'Original album not found.']);
        exit;
    }

    if (is_dir($newPath)) {
        echo json_encode(['success' => false, 'message' => 'An album with the new name already exists.']);
        exit;
    }

    if (rename($oldPath, $newPath)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Rename failed.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
