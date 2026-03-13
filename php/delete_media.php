<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$album = basename($data['album'] ?? '');
$file  = basename($data['file']  ?? '');

if (!$album || !$file) {
    echo json_encode(["success" => false, "message" => "Invalid parameters"]);
    exit;
}

$albumsDir = realpath('../albums');
if (!$albumsDir) {
    echo json_encode(["success" => false, "message" => "Albums directory not found"]);
    exit;
}

$path = $albumsDir . DIRECTORY_SEPARATOR . $album . DIRECTORY_SEPARATOR . $file;

// Ensure resolved path stays within the albums directory and is not a symlink
$realPath = realpath($path);
if (is_link($path) || $realPath === false || strpos($realPath, $albumsDir . DIRECTORY_SEPARATOR) !== 0) {
    echo json_encode(["success" => false, "message" => "Invalid path"]);
    exit;
}

if (file_exists($realPath)) {
    unlink($realPath);
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "File not found"]);
}
