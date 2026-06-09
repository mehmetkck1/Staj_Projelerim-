# Masaustu Bildirim Uygulamasi

Belirli araliklarla Windows masaustune bildirim gonderen basit Python uygulamasi.

## Kurulum

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Calistirma

```powershell
python desktop_notifier.py
```

Varsayilan olarak 30 dakikada bir bildirim gonderir. Sureyi degistirmek icin
`desktop_notifier.py` icindeki `INTERVAL_SECONDS` degerini degistirebilirsin.
