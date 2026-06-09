<?php
session_start();
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

require_admin();

$pollId = (int)($_GET["poll_id"] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM polls WHERE id=?");
$stmt->execute([$pollId]);
$poll = $stmt->fetch();
if (!$poll) die("Anket bulunamadı.");

$optsStmt = $pdo->prepare("SELECT * FROM poll_options WHERE poll_id=? ORDER BY id ASC");
$optsStmt->execute([$pollId]);
$options = $optsStmt->fetchAll();

$total = 0;
foreach ($options as $o) $total += (int)$o["votes"];

$title = "Sonuçlar";
$subtitle = "Yönetim";
require_once __DIR__ . "/../partials/header.php";
?>
<div class="card">
  <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center">
    <div>
      <h2 style="margin:0 0 6px 0;">Sonuçlar</h2>
      <div class="help">Toplam oy: <b><?= (int)$total ?></b></div>
    </div>
    <a class="btn secondary" href="/survey-panel/admin/dashboard.php">← Admin Panel</a>
  </div>
  <h3 style="margin:12px 0 0 0;"><?= h($poll["question"]) ?></h3>
</div>

<div class="card">
  <?php foreach($options as $o): 
    $v = (int)$o["votes"];
    $pct = ($total > 0) ? round(($v / $total) * 100, 1) : 0;
  ?>
    <div style="margin-top:14px;">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
        <div><?= h($o["option_text"]) ?></div>
        <div class="help"><?= $v ?> oy · <?= $pct ?>%</div>
      </div>
      <div class="barwrap" style="margin-top:6px;">
        <div class="bar" style="width: <?= $pct ?>%"></div>
      </div>
    </div>
  <?php endforeach; ?>

  <?php if(!$options): ?>
    Seçenek bulunamadı.
  <?php endif; ?>
</div>

<?php require_once __DIR__ . "/../partials/footer.php"; ?>
