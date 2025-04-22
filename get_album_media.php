<?php
header('Content-Type: application/json');

$albumName = $_GET['album'] ?? '';

$albumPath = "../albums/$albumName";

if (!is_dir($albumPath)) {
  echo json_encode([]);
  exit;
}

$files = array_filter(scandir($albumPath), function($f) use ($albumPath) {
  return is_file("$albumPath/$f");
});

echo json_encode(array_values($files));
?>
