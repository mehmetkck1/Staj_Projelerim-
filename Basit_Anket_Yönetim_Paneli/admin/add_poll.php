<?php
session_start();
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth.php";

require_admin();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $question = trim($_POST["question"] ?? "");
  $is_active = isset($_POST["is_active"]) ? 1 : 0;
  $options = $_POST["options"] ?? [];

  $clean = [];
  foreach ($options as $op) {
    $t = trim((string)$op);
    if ($t !== "") $clean[] = $t;
  }

  if ($question === "") {
    flash_set("err", "Soru boş olamaz.");
    redirect("/survey-panel/admin/add_poll.php");
  }
  if (count($clean) < 2) {
    flash_set("err", "En az 2 seçenek gir.");
    redirect("/survey-panel/admin/add_poll.php");
  }

  $pdo->beginTransaction();
  try {
    $stmt = $pdo->prepare("INSERT INTO polls (question, is_active) VALUES (?, ?)");
    $stmt->execute([$question, $is_active]);
    $pollId = (int)$pdo->lastInsertId();

    $ins = $pdo->prepare("INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)");
    foreach ($clean as $t) $ins->execute([$pollId, $t]);

    $pdo->commit();
    flash_set("ok", "✅ Anket oluşturuldu.");
    redirect("/survey-panel/admin/dashboard.php");
  } catch (Exception $e) {
    $pdo->rollBack();
    flash_set("err", "Kaydetme hatası.");
    redirect("/survey-panel/admin/add_poll.php");
  }
}

$title = "Yeni Anket";
$subtitle = "Yönetim";
require_once __DIR__ . "/../partials/header.php";
?>
<div class="card" style="max-width:860px;margin:0 auto;">
  <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center">
    <div>
      <h2 style="margin:0 0 6px 0;">Yeni Anket Oluştur</h2>
      <div class="help">Soru + en az 2 seçenek ekle.</div>
    </div>
    <a class="btn secondary" href="/survey-panel/admin/dashboard.php">← Geri</a>
  </div>

  <form method="post" style="margin-top:10px" id="pollForm">
    <label class="label">Soru</label>
    <input class="input" name="question" placeholder="Örn: En sevdiğin programlama dili?" required>

    <label class="label" style="display:flex;gap:10px;align-items:center;margin-top:12px">
      <input type="checkbox" name="is_active" checked>
      Aktif yap
    </label>

    <div class="grid" style="margin-top:12px">
      <div>
        <h3 style="margin:0 0 6px 0;">Seçenekler</h3>
        <div id="optionsArea">
          <input class="input" name="options[]" placeholder="Seçenek 1" required>
          <div style="height:10px"></div>
          <input class="input" name="options[]" placeholder="Seçenek 2" required>
        </div>

        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn secondary" type="button" onclick="addOpt()">+ Seçenek Ekle</button>
          <button class="btn" type="submit">Kaydet</button>
        </div>

        <div class="help">İstediğin kadar seçenek ekleyebilirsin.</div>
      </div>

      <div>
        <h3 style="margin:0 0 6px 0;">İpucu</h3>
        <div class="card" style="background:var(--card2);border-radius:14px">
          <div class="help">
            • Hocaya teslim için: <b>survey_app.sql</b> dosyasını phpMyAdmin → Import ile içe aktar.<br>
            • Sonra proje: <b>http://localhost/survey-panel/</b><br>
            • Admin: <b>admin / Admin123!</b>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>

<script>
function addOpt(){
  const area = document.getElementById('optionsArea');
  const spacer = document.createElement('div');
  spacer.style.height = '10px';
  const inp = document.createElement('input');
  inp.className = 'input';
  inp.name = 'options[]';
  inp.placeholder = 'Yeni seçenek';
  area.appendChild(spacer);
  area.appendChild(inp);
}
</script>

<?php require_once __DIR__ . "/../partials/footer.php"; ?>
