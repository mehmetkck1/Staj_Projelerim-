<?php
// upload.php
$allowedMime = [
  "application/pdf" => "pdf",
  "image/jpeg"      => "jpg",
  "image/png"       => "png",
];

$maxBytes = 5 * 1024 * 1024; // 5 MB
$uploadDir = __DIR__ . "/uploads";
if (!is_dir($uploadDir)) mkdir($uploadDir, 0775, true);

$msg = "";
$type = "err";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  if (!isset($_FILES["file"]) || $_FILES["file"]["error"] !== UPLOAD_ERR_OK) {
    $msg = "Dosya yüklenemedi. (Hata kodu: " . ($_FILES["file"]["error"] ?? "yok") . ")";
  } else {
    $f = $_FILES["file"];

    if ($f["size"] > $maxBytes) {
      $msg = "Dosya çok büyük. Maks: " . ($maxBytes / 1024 / 1024) . " MB";
    } else {
      $finfo = new finfo(FILEINFO_MIME_TYPE);
      $mime  = $finfo->file($f["tmp_name"]);

      if (!isset($allowedMime[$mime])) {
        $msg = "Geçersiz dosya türü. Sadece: PDF, JPG/JPEG, PNG kabul edilir. (Algılanan: $mime)";
      } else {
        $ext = $allowedMime[$mime];
        $safeName = bin2hex(random_bytes(16)) . "." . $ext;
        $target = $uploadDir . "/" . $safeName;

        if (!move_uploaded_file($f["tmp_name"], $target)) {
          $msg = "Dosya kaydedilemedi.";
        } else {
          $type = "ok";
          $msg = "✅ Yüklendi: uploads/$safeName (Tür: $mime)";
        }
      }
    }
  }
}
?>
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Dosya Yükleme</title>
  <style>
    :root{
      --bg1:#0b1120;
      --bg2:#0a1630;
      --card: rgba(255,255,255,.06);
      --border: rgba(255,255,255,.10);
      --text:#e5e7eb;
      --muted:#9ca3af;
      --accent:#2563eb;
      --radius:18px;
    }

    *{box-sizing:border-box}
    body{
      margin:0;
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
      color:var(--text);
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
      background:
        radial-gradient(800px 500px at 20% 10%, rgba(37,99,235,.25), transparent 60%),
        radial-gradient(700px 500px at 90% 30%, rgba(16,185,129,.18), transparent 55%),
        linear-gradient(180deg, var(--bg2), var(--bg1));
    }

    .wrap{width:100%; max-width:560px;}

    .card{
      background:var(--card);
      border:1px solid var(--border);
      border-radius:var(--radius);
      padding:22px;
      backdrop-filter: blur(14px);
      box-shadow: 0 18px 60px rgba(0,0,0,.35);
    }

    .title{display:flex;align-items:center;gap:10px;margin:0;font-size:20px;font-weight:800}
    .subtitle{margin:8px 0 0 0;color:var(--muted);font-size:13px;line-height:1.4}

    .pill{
      display:inline-block;
      padding:4px 10px;
      border-radius:999px;
      border:1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.06);
      color:var(--muted);
      font-size:12px;
      margin-top:10px;
    }

    /* ORTALI & SİMETRİK UPLOAD ALANI */
    .drop{
      margin-top:16px;
      border:1px dashed rgba(255,255,255,.22);
      border-radius:16px;
      padding:16px;
      background: rgba(0,0,0,.18);
    }
    .drop-inner{
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:12px;
    }

    /* gerçek input gizli */
    .file-hidden{
      position:absolute;
      width:1px;height:1px;
      opacity:0;
      pointer-events:none;
    }

    .pick-row{
      width:100%;
      display:flex;
      gap:12px;
      align-items:center;
      justify-content:center;
      flex-wrap:wrap;
    }

    .btn{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:12px 14px;
      border-radius:14px;
      border:0;
      background: linear-gradient(180deg, #3b82f6, var(--accent));
      color:white;
      font-weight:800;
      cursor:pointer;
      transition:.15s transform, .15s filter;
      box-shadow: 0 12px 30px rgba(37,99,235,.25);
      user-select:none;
    }
    .btn:hover{transform: translateY(-1px); filter: brightness(1.05);}
    .btn:active{transform: translateY(0);}

    .btn.pick{
      background: rgba(255,255,255,.10);
      border:1px solid rgba(255,255,255,.14);
      box-shadow:none;
      color:var(--text);
    }

    .file-name{
      max-width:340px;
      width:100%;
      text-align:center;
      padding:10px 12px;
      border-radius:14px;
      border:1px solid rgba(255,255,255,.12);
      background: rgba(10,18,32,.55);
      color: var(--text);
      font-size:13px;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    .btn.upload{
      width:260px;
    }

    .hint-center{
      color:var(--muted);
      font-size:12.5px;
      text-align:center;
    }

    .msg{
      margin-top:14px;
      padding:12px 14px;
      border-radius:14px;
      border:1px solid rgba(255,255,255,.12);
      background: rgba(0,0,0,.22);
      font-size:13px;
      line-height:1.45;
    }
    .msg.ok{
      border-color: rgba(16,185,129,.45);
      box-shadow: 0 0 0 2px rgba(16,185,129,.08) inset;
    }
    .msg.err{
      border-color: rgba(239,68,68,.45);
      box-shadow: 0 0 0 2px rgba(239,68,68,.08) inset;
    }

    @media (max-width:520px){
      .file-name{max-width:100%}
      .btn.upload{width:100%}
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h2 class="title">📁 Dosya Yükleme</h2>
      <p class="subtitle">Yüklemeden önce dosya türü kontrol edilir. Uygun değilse hata verir.</p>
      <span class="pill">İzin: PDF / JPG / PNG · Maks: 5MB</span>

      <form method="post" enctype="multipart/form-data">
        <div class="drop">
          <div class="drop-inner">
            <div class="pick-row">
              <label class="btn pick" for="fileInput">Dosya Seç</label>
              <div id="fileName" class="file-name">Dosya seçilmedi</div>
            </div>

            <button class="btn upload" type="submit">Yükle</button>

            <div class="hint-center">Dosya seç → Yükle’ye bas</div>
          </div>

          <input id="fileInput" class="file-hidden" type="file" name="file" required>
        </div>

        <?php if($_SERVER["REQUEST_METHOD"] === "POST" && $msg): ?>
  <div class="msg <?= $type ?>"><?= htmlspecialchars($msg) ?></div>
<?php endif; ?>

      </form>
    </div>
  </div>

  <script>
    const input = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');

    input.addEventListener('change', () => {
      fileName.textContent = input.files?.[0]?.name || "Dosya seçilmedi";
    });
  </script>
</body>
</html>
