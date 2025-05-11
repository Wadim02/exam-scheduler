# exam_app/email_utils.py

def trimite_email_sefi_grupa(emailuri: list[str]):
    for email in emailuri:
        print(f"[TEST] Trimitem email către {email} cu mesajul: 'Te rugăm să propui date pentru examene în platformă.'")
