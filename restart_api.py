#!/usr/bin/env python3
"""Upload fixed API and restart service"""
import paramiko, time

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"
LOCAL    = "/home/kali/.gemini/antigravity/scratch/sphera"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
sftp = ssh.open_sftp()
sftp.put(f"{LOCAL}/reels_api.py", "/opt/sphera/reels_api.py")
sftp.close()

def run(cmd, timeout=30):
    _, o, e = ssh.exec_command(cmd, timeout=timeout)
    return (o.read().decode() + e.read().decode()).strip()

print("Testing import locally on server:")
print(run("python3 -c 'import flask, werkzeug; print(\"OK\", flask.__version__)'"))

print("Restarting service...")
print(run("systemctl restart sphera-reels"))
time.sleep(4)
print("Status:", run("systemctl is-active sphera-reels"))
print("Health:", run("curl -s http://127.0.0.1:5050/api/health 2>&1"))
print("Log:", run("journalctl -u sphera-reels -n 5 --no-pager 2>&1"))
ssh.close()
