import time

from plyer import notification


APP_NAME = "Masaustu Bildirim Uygulamasi"
INTERVAL_SECONDS = 60 * 1


def send_notification(title: str, message: str) -> None:
    notification.notify(
        title=title,
        message=message,
        app_name=APP_NAME,
        timeout=10,
    )


def main() -> None:
    while True:
        send_notification(
            "Hatirlatma",
            "python codu kusursuz calisiyor",
        )
        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
