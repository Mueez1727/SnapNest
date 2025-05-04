<?php
$data = json_decode(file_get_contents("php://input"), true);

$albumName = $data['name'];
$albumPath = './albums/' . $albumName;

$response = ['success' => false, 'message' => ''];

function deleteFolder($folder) {
    foreach (glob($folder . '/*') as $file) {
        if (is_dir($file)) {
            deleteFolder($file);
        } else {
            unlink($file);
        }
    }
    return rmdir($folder);
}

if (!is_dir($albumPath)) {
    $response['message'] = 'Album does not exist';
} else {
    if (deleteFolder($albumPath)) {
        $response['success'] = true;
    } else {
        $response['message'] = 'Failed to delete album';
    }
}

header('Content-Type: application/json');
echo json_encode($response);
