<?php
// config/helpers.php
declare(strict_types=1);

function h(string $s): string {
  return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function redirect(string $path): never {
  header("Location: {$path}");
  exit;
}

function client_ip(): string {
  return $_SERVER["REMOTE_ADDR"] ?? "unknown";
}

function flash_set(string $type, string $msg): void {
  $_SESSION["flash"] = ["type" => $type, "msg" => $msg];
}

function flash_get(): ?array {
  if (!isset($_SESSION["flash"])) return null;
  $f = $_SESSION["flash"];
  unset($_SESSION["flash"]);
  return $f;
}
