<?php
header('Content-Type: application/json');

$albumsDir = 'albums/';
$name = $_POST['name'] ?? '';

if (!$name) {
    echo json_encode(['success' => false, 'message' => 'Missing album name']);
    exit;
}

$path = $albumsDir . $name;

function deleteFolder($folderPath) {
    foreach (scandir($folderPath) as $item) {
        if ($item === '.' || $item === '..') continue;
        $itemPath = $folderPath . DIRECTORY_SEPARATOR . $item;
        is_dir($itemPath) ? deleteFolder($itemPath) : unlink($itemPath);
    }
    rmdir($folderPath);
}

if (!is_dir($path)) {
    echo json_encode(['success' => false, 'message' => 'Album does not exist']);
    exit;
}

deleteFolder($path);
echo json_encode(['success' => true]);
?>
