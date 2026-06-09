<?php
session_start();
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../config/helpers.php";

if (isset($_SESSION["admin_id"])) {
  redirect("/survey-panel/admin/dashboard.php");
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $username = trim($_POST["username"] ?? "");
  $password = (string)($_POST["password"] ?? "");

  $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ?");
  $stmt->execute([$username]);
  $admin = $stmt->fetch();

  if ($admin && password_verify($password, $admin["password_hash"])) {
    $_SESSION["admin_id"] = $admin["id"];
    $_SESSION["admin_user"] = $admin["username"];
    flash_set("ok", "Hoş geldin, ".$admin["username"]."!");
    redirect("/survey-panel/admin/dashboard.php");
  }

  flash_set("err", "Kullanıcı adı veya şifre hatalı.");
  redirect("/survey-panel/admin/login.php");
}

$title = "Admin Giriş";
$subtitle = "Yönetim";
require_once __DIR__ . "/../partials/header.php";
?>
<div class="card" style="max-width:520px;margin:0 auto;">
  <h2 style="margin:0 0 6px 0;">Admin Giriş</h2>
  <div class="help">Varsayılan: admin / Admin123!</div>

  <form method="post">
    <label class="label">Kullanıcı adı</label>
    <input class="input" name="username" autocomplete="username" required>

    <label class="label">Şifre</label>
    <input class="input" name="password" type="password" autocomplete="current-password" required>

    <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn" type="submit">Giriş</button>
      <a class="btn secondary" href="/survey-panel/index.php">Geri</a>
    </div>
  </form>
</div>
<?php require_once __DIR__ . "/../partials/footer.php"; ?>
