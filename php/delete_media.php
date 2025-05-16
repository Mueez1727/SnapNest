<?php
$data = json_decode(file_get_contents("php://input"), true);
$album = $data['album'] ?? '';
$file = $data['file'] ?? '';

$path = "../albums/$album/$file";
if (file_exists($path)) {
    unlink($path);
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}
