<?php
// php/upload_media.php

header('Content-Type: application/json');

$album = $_POST['album'] ?? null;
if (!$album) {
    echo json_encode(['success' => false, 'message' => 'No album specified']);
    exit;
}

$albumFolder = "../uploads/" . preg_replace('/[^a-zA-Z0-9-_]/', '_', $album);

if (!file_exists($albumFolder)) {
    echo json_encode(['success' => false, 'message' => 'Album folder not found']);
    exit;
}

// Save uploaded media
foreach ($_FILES['media']['tmp_name'] as $key => $tmpName) {
    $fileName = basename($_FILES['media']['name'][$key]);
    move_uploaded_file($tmpName, "$albumFolder/$fileName");
}

// Optional: update photoCount and videoCount in albums.json
$albumsFile = '../data/albums.json';
if (file_exists($albumsFile)) {
    $albums = json_decode(file_get_contents($albumsFile), true);
    foreach ($albums as &$a) {
        if (strtolower($a['name']) === strtolower($album)) {
            // Scan files
            $photos = glob("$albumFolder/*.{jpg,jpeg,png,gif}", GLOB_BRACE);
            $videos = glob("$albumFolder/*.{mp4,mov,avi,mkv}", GLOB_BRACE);
            $a['photoCount'] = count($photos);
            $a['videoCount'] = count($videos);
            break;
        }
    }
    file_put_contents($albumsFile, json_encode($albums, JSON_PRETTY_PRINT));
}

echo json_encode(['success' => true]);
?>
