#!/usr/bin/env python3
"""Quick redeploy of updated app.js and index.html only"""
import paramiko

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"
REMOTE   = "/opt/sphera"
LOCAL    = "/home/kali/.gemini/antigravity/scratch/sphera"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
sftp = ssh.open_sftp()

files = ["app.js", "index.html"]
for f in files:
    print(f"  ↑ Uploading {f}...")
    sftp.put(f"{LOCAL}/{f}", f"{REMOTE}/{f}")

sftp.close()
ssh.exec_command(f"chown www-data:www-data {REMOTE}/app.js {REMOTE}/index.html")
ssh.close()
print("✅ Done — hard refresh the browser to see changes.")
