<?php
date_default_timezone_set('Asia/Karachi');

$album = $_POST['album'] ?? '';
$album = basename($album); // Prevent directory traversal
$uploadDir = '../albums/' . $album . '/';
$albumsFile = '../data/albums.json';
$targetDir = "../albums/" . $album . "/";

if (!$album || !is_dir($uploadDir)) {
    echo json_encode(['success' => false, 'message' => 'Invalid album name or folder missing']);
    exit;
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
$uploadSuccess = [];

if (!isset($_FILES['media'])) {
    echo json_encode(['success' => false, 'message' => 'No files uploaded']);
    exit;
}

foreach ($_FILES['media']['tmp_name'] as $index => $tmpPath) {
    $originalName = basename($_FILES['media']['name'][$index]);
    $type = $_FILES['media']['type'][$index];
    $error = $_FILES['media']['error'][$index];

    if ($error === UPLOAD_ERR_OK && in_array($type, $allowedTypes)) {
        $safeName = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $originalName); // sanitize filename
        $targetPath = $uploadDir . $safeName;

        // Prevent duplicate overwrite
        $i = 1;
        $nameOnly = pathinfo($safeName, PATHINFO_FILENAME);
        $ext = pathinfo($safeName, PATHINFO_EXTENSION);
        while (file_exists($targetPath)) {
            $safeName = $nameOnly . "_$i." . $ext;
            $targetPath = $uploadDir . $safeName;
            $i++;
        }

        if (move_uploaded_file($tmpPath, $targetPath)) {
            $uploadSuccess[] = $safeName;
        }
    }
}

// Recount all media in the album
$photoCount = 0;
$videoCount = 0;
$allFiles = array_diff(scandir($uploadDir), ['.', '..']);
$photoExts = ['jpg', 'jpeg', 'png', 'gif'];
$videoExts = ['mp4', 'webm', 'ogg'];

foreach ($allFiles as $file) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if (in_array($ext, $photoExts)) {
        $photoCount++;
    } elseif (in_array($ext, $videoExts)) {
        $videoCount++;
    }
}

// Update albums.json
if (file_exists($albumsFile)) {
    $albums = json_decode(file_get_contents($albumsFile), true);

    foreach ($albums as &$item) {
        if ($item['name'] === $album) {
            $item['photoCount'] = $photoCount;
            $item['videoCount'] = $videoCount;
            $item['latestActivity'] = date("F j, Y, h:i A");
            break;
        }
    }

    file_put_contents($albumsFile, json_encode($albums, JSON_PRETTY_PRINT));
}

echo json_encode([
    'success' => true,
    'uploaded' => $uploadSuccess,
    'photoCount' => $photoCount,
    'videoCount' => $videoCount
]);
