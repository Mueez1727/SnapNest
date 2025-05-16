<?php
$album = $_GET['album'] ?? '';
$album = basename($album); // secure against path traversal
$dir = "../albums/$album";

if (!is_dir($dir)) {
    echo json_encode([]);
    exit;
}

$mediaFiles = array_filter(scandir($dir), function($file) use ($dir) {
    return !is_dir("$dir/$file") && preg_match('/\.(jpg|jpeg|png|gif|mp4|mov|avi|mkv)$/i', $file);
});

echo json_encode(array_values($mediaFiles));
