<?php
$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data['name']);

$albumsFile = '../data/albums.json';
$albumsDir = '../albums/';
$albumPath = $albumsDir . $name;

if (!$name) {
    echo json_encode(['success' => false, 'message' => 'Invalid name']);
    exit;
}

// Read existing albums
$albums = file_exists($albumsFile) ? json_decode(file_get_contents($albumsFile), true) : [];

$index = -1;
foreach ($albums as $i => $album) {
    if ($album['name'] === $name) {
        $index = $i;
        break;
    }
}

if ($index === -1) {
    echo json_encode(['success' => false, 'message' => 'Album not found']);
    exit;
}

// Remove the album from the array
array_splice($albums, $index, 1);

// Save updated albums.json
file_put_contents($albumsFile, json_encode($albums, JSON_PRETTY_PRINT));

// Delete album folder recursively
function deleteFolder($folderPath) {
    if (!is_dir($folderPath)) return;
    foreach (scandir($folderPath) as $file) {
        if ($file !== "." && $file !== "..") {
            $filePath = $folderPath . DIRECTORY_SEPARATOR . $file;
            is_dir($filePath) ? deleteFolder($filePath) : unlink($filePath);
        }
    }
    rmdir($folderPath);
}

if (is_dir($albumPath)) {
    deleteFolder($albumPath);
}

echo json_encode(['success' => true]);
?>
