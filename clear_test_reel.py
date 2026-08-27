#!/usr/bin/env python3
"""Delete the test reel and deploy updated app.js"""
import paramiko

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"
LOCAL    = "/home/kali/.gemini/antigravity/scratch/sphera"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)

# 1. Clear all test reels from reels.json (user will re-upload for real)
sftp = ssh.open_sftp()
sftp.put(f"{LOCAL}/app.js", "/opt/sphera/app.js")
print("✅ Uploaded app.js")
sftp.close()

def run(cmd):
    _, o, e = ssh.exec_command(cmd, timeout=20)
    return (o.read().decode() + e.read().decode()).strip()

# 2. Clear reels.json (remove the test upload)
print(run("echo '[]' > /opt/sphera/data/reels.json"))
print(run("ls /opt/sphera/uploads/"))
print(run("rm -f /opt/sphera/uploads/*.mp4 /opt/sphera/uploads/*.mov"))
print("✅ Cleared test reel")
print("Done!")
ssh.close()
