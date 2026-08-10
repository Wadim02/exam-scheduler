
def send_email_to_group_leaders(emails: list[str]):
    for email in emails:
        print(f"[TEST] Sending email to {email} with message: 'Please submit proposed exam dates in the platform.'")