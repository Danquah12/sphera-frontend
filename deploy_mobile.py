#!/usr/bin/env python3
"""Deploy style.css, app.js, and index.html to production"""
import paramiko

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"
LOCAL    = "/home/kali/.gemini/antigravity/scratch/sphera"
REMOTE   = "/opt/sphera"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
sftp = ssh.open_sftp()

for f in ["app.js", "index.html", "style.css"]:
    print(f"  ↑ {f}")
    sftp.put(f"{LOCAL}/{f}", f"{REMOTE}/{f}")

sftp.close()
ssh.exec_command(f"chown www-data:www-data {REMOTE}/app.js {REMOTE}/index.html {REMOTE}/style.css")
ssh.close()
print("✅ All files deployed!")
