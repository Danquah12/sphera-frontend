#!/usr/bin/env python3
"""Check API status and verify health endpoint"""
import paramiko

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)

checks = [
    "systemctl is-active sphera-reels",
    "curl -s http://127.0.0.1:5050/api/health",
    "curl -s https://sphera.expediteconsults.com/api/health",
    "ls /opt/sphera/uploads/ | wc -l",
]

for cmd in checks:
    _, out, err = ssh.exec_command(cmd, timeout=15)
    result = out.read().decode().strip() or err.read().decode().strip()
    print(f"$ {cmd}\n  → {result}\n")

ssh.close()
