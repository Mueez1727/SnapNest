<?php
// php/theme_setting.php

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['theme'])) {
        $_SESSION['theme'] = $data['theme'];
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
} else {
    $theme = $_SESSION['theme'] ?? 'light';
    echo json_encode(['theme' => $theme]);
}
?>
