<?php
// config/db.php (NO install here; DB must be imported from survey_app.sql)
declare(strict_types=1);

$host = "localhost";
$db   = "survey_app";
$user = "root";
$pass = "";

try {
  $pdo = new PDO(
    "mysql:host={$host};dbname={$db};charset=utf8mb4",
    $user,
    $pass,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]
  );
} catch (PDOException $e) {
  die("Veritabanı bağlantı hatası. Önce survey_app.sql içe aktarılmalı.");
}
