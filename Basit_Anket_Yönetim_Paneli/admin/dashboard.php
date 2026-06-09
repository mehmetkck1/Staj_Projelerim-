<?php
session_start();
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

require_admin();

// Toggle active status
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["toggle_id"])) {
  $id = (int)$_POST["toggle_id"];
  $pdo->prepare("UPDATE polls SET is_active = 1 - is_active WHERE id=?")->execute([$id]);
  flash_set("ok", "Anket durumu güncellendi.");
  redirect("/survey-panel/admin/dashboard.php");
}

$polls = $pdo->query("SELECT * FROM polls ORDER BY created_at DESC")->fetchAll();

$title = "Admin Panel";
$subtitle = "Yönetim";
require_once __DIR__ . "/../partials/header.php";
?>
<div class="card">
  <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center">
    <div>
      <h2 style="margin:0 0 6px 0;">Anket Yönetimi</h2>
      <div class="help">Anket ekle, aktif/pasif yap, sonuçları görüntüle.</div>
    </div>
    <a class="btn" href="/survey-panel/admin/add_poll.php">+ Yeni Anket</a>
  </div>
</div>

<div class="card">
  <h3 style="margin:0 0 6px 0;">Tüm Anketler</h3>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Soru</th>
        <th>Durum</th>
        <th>İşlem</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($polls as $p): ?>
      <tr>
        <td><?= (int)$p["id"] ?></td>
        <td><?= h($p["question"]) ?></td>
        <td>
          <?php if((int)$p["is_active"] === 1): ?>
            <span class="tag on">Aktif</span>
          <?php else: ?>
            <span class="tag off">Pasif</span>
          <?php endif; ?>
        </td>
        <td style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <a class="btn small secondary" href="/survey-panel/admin/results.php?poll_id=<?= (int)$p["id"] ?>">Sonuçlar</a>
          <form method="post" style="margin:0">
            <input type="hidden" name="toggle_id" value="<?= (int)$p["id"] ?>">
            <button class="btn small" type="submit"><?= (int)$p["is_active"] ? "Pasif Yap" : "Aktif Yap" ?></button>
          </form>
        </td>
      </tr>
      <?php endforeach; ?>
      <?php if(!$polls): ?>
        <tr><td colspan="4">Henüz anket yok.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php require_once __DIR__ . "/../partials/footer.php"; ?>
