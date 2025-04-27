<?php
// php/get_albums.php

header('Content-Type: application/json');

$albumsFile = '../data/albums.json';

if (!file_exists($albumsFile)) {
    echo json_encode([]);
    exit;
}

$albumsData = file_get_contents($albumsFile);
echo $albumsData;
?>
