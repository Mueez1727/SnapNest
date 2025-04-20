<?php
$targetDir = "albums/";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['album']) && isset($_FILES['media'])) {
    $album = basename($_POST['album']); // sanitize album name
    $albumPath = $targetDir . $album;

    if (!is_dir($albumPath)) {
        mkdir($albumPath, 0777, true);
    }

    $files = $_FILES['media'];
    $uploaded = [];

    for ($i = 0; $i < count($files['name']); $i++) {
        $filename = basename($files['name'][$i]);
        $tempPath = $files['tmp_name'][$i];
        $destPath = $albumPath . "/" . $filename;

        if (move_uploaded_file($tempPath, $destPath)) {
            $uploaded[] = $filename;
        }
    }

    echo json_encode(["success" => true, "uploaded" => $uploaded]);
} else {
    echo json_encode(["success" => false, "error" => "Invalid request."]);
}
?>
