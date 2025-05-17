<?php
header('Content-Type: application/json');

$albumsFile = '../data/albums.json';
$albumsDir = '../albums';  // Your physical albums folder path

if (!file_exists($albumsFile)) {
    echo json_encode([]);
    exit;
}

$albumsData = json_decode(file_get_contents($albumsFile), true);
if (!$albumsData) {
    echo json_encode([]);
    exit;
}

foreach ($albumsData as &$album) {
    $albumName = $album['name'] ?? '';
    $albumPath = $albumsDir . DIRECTORY_SEPARATOR . $albumName;

    $photoCount = 0;
    $videoCount = 0;
    $thumbnail = null;

    if (is_dir($albumPath)) {
        $files = scandir($albumPath);
        foreach ($files as $file) {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif'])) {
                $photoCount++;
                if (!$thumbnail) {
                    $thumbnail = "albums/" . rawurlencode($albumName) . "/" . rawurlencode($file);
                }
            } elseif (in_array($ext, ['mp4', 'mov', 'avi', 'mkv'])) {
                $videoCount++;
                if (!$thumbnail) {
                    $thumbnail = "albums/" . rawurlencode($albumName) . "/" . rawurlencode($file);
                }
            }
        }
    }

    $album['photos'] = $photoCount;
    $album['videos'] = $videoCount;
    $album['thumbnail'] = $thumbnail;  // Add thumbnail to album data
}

echo json_encode($albumsData);
