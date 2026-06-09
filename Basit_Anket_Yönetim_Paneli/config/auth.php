<?php
// config/auth.php
declare(strict_types=1);

function require_admin(): void {
  if (!isset($_SESSION["admin_id"])) {
    header("Location: /survey-panel/admin/login.php");
    exit;
  }
}
