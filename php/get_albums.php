<?php
// php/get_albums.php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$albumsFile = '../data/albums.json';

if (!file_exists($albumsFile)) {
    echo json_encode([]);
    exit;
}

$albumsData = file_get_contents($albumsFile);
$decoded = json_decode($albumsData, true);

// If JSON is invalid, return empty array
if ($decoded === null) {
    echo json_encode([]);
    exit;
}

echo json_encode($decoded, JSON_PRETTY_PRINT);
?>
