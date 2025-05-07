<?php
$album = $_POST['album'] ?? '';
$uploadDir = '../albums/' . $album . '/';
$albumsFile = '../data/albums.json';

if (!$album || !is_dir($uploadDir)) {
    echo json_encode(['success' => false, 'message' => 'Invalid album name or folder missing']);
    exit;
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
$photoCount = 0;
$videoCount = 0;
$uploadSuccess = [];

foreach ($_FILES['media']['tmp_name'] as $index => $tmpPath) {
    $name = basename($_FILES['media']['name'][$index]);
    $type = $_FILES['media']['type'][$index];
    $error = $_FILES['media']['error'][$index];

    if ($error === UPLOAD_ERR_OK && in_array($type, $allowedTypes)) {
        $targetPath = $uploadDir . $name;
        if (move_uploaded_file($tmpPath, $targetPath)) {
            if (str_starts_with($type, 'image')) $photoCount++;
            if (str_starts_with($type, 'video')) $videoCount++;
            $uploadSuccess[] = $name;
        }
    }
}

// Update albums.json
if (file_exists($albumsFile)) {
    $albums = json_decode(file_get_contents($albumsFile), true);

    foreach ($albums as &$item) {
        if ($item['name'] === $album) {
            $item['photoCount'] += $photoCount;
            $item['videoCount'] += $videoCount;
            $item['latestActivity'] = date('Y-m-d');
            break;
        }
    }

    file_put_contents($albumsFile, json_encode($albums, JSON_PRETTY_PRINT));
}

echo json_encode([
    'success' => true,
    'uploaded' => $uploadSuccess,
    'photoCount' => $photoCount,
    'videoCount' => $videoCount
]);
?>
