<?php
// partials/header.php
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
require_once __DIR__ . "/../config/helpers.php";
$flash = flash_get();
?>
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="stylesheet" href="/survey-panel/assets/style.css" />
  <title><?= h($title ?? "Anket") ?></title>
</head>
<body>
  <div class="container">
    <div class="topbar">
      <div class="brand">
        <div style="font-weight:900;font-size:18px">📊 Basit Anket</div>
        <span class="badge"><?= h($subtitle ?? "Yönetim Paneli") ?></span>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <a class="btn secondary" href="/survey-panel/index.php">Anketler</a>
        <?php if(isset($_SESSION["admin_id"])): ?>
          <a class="btn secondary" href="/survey-panel/admin/dashboard.php">Admin</a>
          <a class="btn danger" href="/survey-panel/admin/logout.php">Çıkış</a>
        <?php else: ?>
          <a class="btn secondary" href="/survey-panel/admin/login.php">Admin Giriş</a>
        <?php endif; ?>
      </div>
    </div>

    <?php if($flash): ?>
      <div class="flash <?= $flash["type"] === "ok" ? "ok" : "err" ?>"><?= h($flash["msg"]) ?></div>
    <?php endif; ?>
