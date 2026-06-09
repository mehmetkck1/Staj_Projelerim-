<?php
session_start();
require_once __DIR__ . "/config/db.php";
require_once __DIR__ . "/config/helpers.php";

$pollId = (int)($_GET["poll_id"] ?? $_POST["poll_id"] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM polls WHERE id=? AND is_active=1");
$stmt->execute([$pollId]);
$poll = $stmt->fetch();
if (!$poll) die("Anket bulunamadı veya pasif.");

$optsStmt = $pdo->prepare("SELECT * FROM poll_options WHERE poll_id=? ORDER BY id ASC");
$optsStmt->execute([$pollId]);
$options = $optsStmt->fetchAll();

$ip = client_ip();
$check = $pdo->prepare("SELECT id FROM poll_votes WHERE poll_id=? AND voter_ip=?");
$check->execute([$pollId, $ip]);
$alreadyVoted = (bool)$check->fetch();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  if ($alreadyVoted) {
    flash_set("err", "Bu ankete daha önce oy verdin (IP bazlı).");
    redirect("/survey-panel/vote.php?poll_id=".$pollId);
  }

  $optionId = (int)($_POST["option_id"] ?? 0);
  $valid = false;
  foreach ($options as $o) {
    if ((int)$o["id"] === $optionId) { $valid = true; break; }
  }
  if (!$valid) {
    flash_set("err", "Geçersiz seçenek.");
    redirect("/survey-panel/vote.php?poll_id=".$pollId);
  }

  $pdo->beginTransaction();
  try {
    $up = $pdo->prepare("UPDATE poll_options SET votes = votes + 1 WHERE id=? AND poll_id=?");
    $up->execute([$optionId, $pollId]);

    $ins = $pdo->prepare("INSERT INTO poll_votes (poll_id, voter_ip) VALUES (?, ?)");
    $ins->execute([$pollId, $ip]);

    $pdo->commit();
    flash_set("ok", "✅ Oyun kaydedildi!");
  } catch (Exception $e) {
    $pdo->rollBack();
    flash_set("err", "Oylama başarısız.");
  }

  redirect("/survey-panel/vote.php?poll_id=".$pollId);
}

$title = "Oy Ver";
$subtitle = "Kullanıcı";
require_once __DIR__ . "/partials/header.php";
?>
<div class="card">
  <a href="/survey-panel/index.php">← Anketlere dön</a>
  <h2 style="margin:10px 0 0 0;"><?= h($poll["question"]) ?></h2>
  <div class="help">IP: <?= h($ip) ?> · <?= $alreadyVoted ? "Bu ankette oy kullanılmış görünüyor." : "Henüz oy kullanmadın." ?></div>

  <form method="post" style="margin-top:10px;">
    <input type="hidden" name="poll_id" value="<?= (int)$pollId ?>">

    <?php foreach($options as $o): ?>
      <label class="option">
        <input type="radio" name="option_id" value="<?= (int)$o["id"] ?>" required <?= $alreadyVoted ? "disabled" : "" ?>>
        <span><?= h($o["option_text"]) ?></span>
      </label>
    <?php endforeach; ?>

    <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn" type="submit" <?= $alreadyVoted ? "disabled" : "" ?>>Oy Ver</button>
      <a class="btn secondary" href="/survey-panel/admin/login.php">Admin Giriş</a>
    </div>
  </form>
</div>

<?php require_once __DIR__ . "/partials/footer.php"; ?>
