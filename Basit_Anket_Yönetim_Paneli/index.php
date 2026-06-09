<?php
session_start();
require_once __DIR__ . "/config/db.php";
require_once __DIR__ . "/config/helpers.php";

$title = "Anketler";
$subtitle = "Kullanıcı";
require_once __DIR__ . "/partials/header.php";

$polls = $pdo->query("SELECT * FROM polls WHERE is_active=1 ORDER BY created_at DESC")->fetchAll();
?>
<div class="card">
  <h2 style="margin:0 0 6px 0;">Aktif Anketler</h2>
  <div class="help">Bir ankete girip oy verebilirsin. (IP bazlı tekrar oy engeli var.)</div>
</div>

<?php if(!$polls): ?>
  <div class="card">Şu an aktif anket yok.</div>
<?php else: ?>
  <?php foreach($polls as $p): ?>
    <div class="card">
      <h3 style="margin:0 0 10px 0;"><?= h($p["question"]) ?></h3>
      <a class="btn" href="/survey-panel/vote.php?poll_id=<?= (int)$p["id"] ?>">Oy Ver</a>
    </div>
  <?php endforeach; ?>
<?php endif; ?>

<?php require_once __DIR__ . "/partials/footer.php"; ?>
