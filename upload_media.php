<?php
$targetDir = "albums/";

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['album']) && isset($_FILES['media'])) {
    $album = basename($_POST['album']);
    $albumPath = $targetDir . $album;

    // Validate album name
    if (empty($album) || preg_match('/[^A-Za-z0-9 _-]/', $album)) {
        echo json_encode(["success" => false, "error" => "Invalid album name."]);
        exit;
    }

    // Create album folder if it doesn't exist
    if (!is_dir($albumPath)) {
        if (!mkdir($albumPath, 0777, true)) {
            echo json_encode(["success" => false, "error" => "Failed to create album folder."]);
            exit;
        }
    }

    $files = $_FILES['media'];
    $uploaded = [];

    for ($i = 0; $i < count($files['name']); $i++) {
        $filename = basename($files['name'][$i]);
        $tempPath = $files['tmp_name'][$i];
        $destPath = $albumPath . "/" . $filename;

        // Validate file extension
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv'];
        $fileExt = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (!in_array($fileExt, $allowedExtensions)) {
            continue; // skip invalid file
        }

        // Move file
        if (move_uploaded_file($tempPath, $destPath)) {
            $uploaded[] = $filename;
        }
    }

    if (!empty($uploaded)) {
        echo json_encode(["success" => true, "uploaded" => $uploaded]);
    } else {
        echo json_encode(["success" => false, "error" => "No valid files uploaded."]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Invalid request."]);
}
?>
