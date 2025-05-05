<?php
header('Content-Type: application/json');

$albumsDir = '../albums/';
$dataFile = '../data/albums.json';

$albumList = [];

if (is_dir($albumsDir)) {
    $albumFolders = array_filter(scandir($albumsDir), function ($item) use ($albumsDir) {
        return $item !== '.' && $item !== '..' && is_dir($albumsDir . $item);
    });

    foreach ($albumFolders as $folder) {
        $folderPath = $albumsDir . $folder;
        $mediaFiles = glob($folderPath . '/*');

        $photoCount = 0;
        $videoCount = 0;
        $latestActivity = null;

        foreach ($mediaFiles as $file) {
            $extension = pathinfo($file, PATHINFO_EXTENSION);
            $timestamp = filemtime($file);
            if (!$latestActivity || $timestamp > $latestActivity) {
                $latestActivity = $timestamp;
            }

            if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                $photoCount++;
            } elseif (in_array(strtolower($extension), ['mp4', 'mov', 'avi', 'webm'])) {
                $videoCount++;
            }
        }

        $albumList[] = [
            'name' => $folder,
            'photos' => $photoCount,
            'videos' => $videoCount,
            'latestActivity' => $latestActivity ? date('Y-m-d H:i:s', $latestActivity) : null
        ];
    }
}

// Save to albums.json
file_put_contents($dataFile, json_encode($albumList, JSON_PRETTY_PRINT));

// Return it as JSON response
echo json_encode(['success' => true, 'albums' => $albumList]);
