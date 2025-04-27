<?php
// php/save_album.php

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || empty(trim($data['name']))) {
    echo json_encode(['success' => false, 'message' => 'Invalid album name']);
    exit;
}

$albumName = trim($data['name']);
$albumsFile = '../data/albums.json';

// Load existing albums
$albums = [];
if (file_exists($albumsFile)) {
    $albums = json_decode(file_get_contents($albumsFile), true);
}

// Check if album already exists
foreach ($albums as $album) {
    if (strtolower($album['name']) === strtolower($albumName)) {
        echo json_encode(['success' => false, 'message' => 'Album already exists']);
        exit;
    }
}

// Add new album
$albums[] = [
    'name' => $albumName,
    'creationDate' => date('M d, Y'),
    'photoCount' => 0,
    'videoCount' => 0
];

// Save albums
file_put_contents($albumsFile, json_encode($albums, JSON_PRETTY_PRINT));

// Create album folder
$albumFolder = "../uploads/" . preg_replace('/[^a-zA-Z0-9-_]/', '_', $albumName);
if (!file_exists($albumFolder)) {
    mkdir($albumFolder, 0777, true);
}

echo json_encode(['success' => true]);
?>
