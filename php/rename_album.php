<?php
$data = json_decode(file_get_contents('php://input'), true);
$oldName = trim($data['oldName']);
$newName = trim($data['newName']);

$albumsPath = './albums';

$oldPath = $albumsPath . '/' . $oldName;
$newPath = $albumsPath . '/' . $newName;

$response = ['success' => false, 'message' => ''];

if (is_dir($oldPath)) {
    if (!is_dir($newPath)) {
        rename($oldPath, $newPath);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Album already exists']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Album not found']);
}

header('Content-Type: application/json');
echo json_encode($response);
