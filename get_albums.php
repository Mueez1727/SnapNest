<?php
$albumsDir = 'albums/';
$albums = [];

foreach (scandir($albumsDir) as $albumName) {
    if ($albumName !== '.' && $albumName !== '..' && is_dir("$albumsDir/$albumName")) {
        $createdAt = filectime("$albumsDir/$albumName");
        $latestActivity = 0;
        $photoCount = 0;
        $videoCount = 0;

        foreach (scandir("$albumsDir/$albumName") as $file) {
            $filePath = "$albumsDir/$albumName/$file";
            if ($file !== '.' && $file !== '..' && is_file($filePath)) {
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

                // Count photo/video
                if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'])) {
                    $photoCount++;
                } elseif (in_array($ext, ['mp4', 'mov', 'avi', 'mkv', 'webm'])) {
                    $videoCount++;
                }

                $modifiedTime = filemtime($filePath);
                if ($modifiedTime > $latestActivity) {
                    $latestActivity = $modifiedTime;
                }
            }
        }

        $albums[] = [
            'name' => $albumName,
            'photos' => $photoCount,
            'videos' => $videoCount,
            'date' => date('F j, Y', $latestActivity), // e.g. April 16, 2025
            'createdAt' => date('c', $createdAt),
            'latestActivity' => date('c', $latestActivity)
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($albums);
?>
