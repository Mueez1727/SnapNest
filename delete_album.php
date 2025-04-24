<?php
$albumName = $_POST['name'];
$albumPath = __DIR__ . '/albums/' . $albumName;

function deleteFolder($folderPath) {
  foreach (glob($folderPath . '/*') as $file) {
    is_dir($file) ? deleteFolder($file) : unlink($file);
  }
  return rmdir($folderPath);
}

if (is_dir($albumPath)) {
  deleteFolder($albumPath);
  echo json_encode(['success' => true]);
} else {
  echo json_encode(['success' => false]);
}
?>
