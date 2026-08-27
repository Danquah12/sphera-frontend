#!/usr/bin/env python3
"""Check what's actually on the server — reels.json, uploads dir, nginx config"""
import paramiko

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)

def run(cmd, timeout=20):
    _, o, e = ssh.exec_command(cmd, timeout=timeout)
    return (o.read().decode() + e.read().decode()).strip()

print("=== API Health ===")
print(run("curl -s http://127.0.0.1:5050/api/health"))

print("\n=== Reels JSON ===")
print(run("cat /opt/sphera/data/reels.json 2>/dev/null || echo 'FILE NOT FOUND'"))

print("\n=== Uploads dir ===")
print(run("ls -lh /opt/sphera/uploads/ 2>/dev/null"))

print("\n=== nginx /api proxy test ===")
print(run("curl -s https://sphera.expediteconsults.com/api/health 2>&1 | head -3"))

print("\n=== nginx client_max_body_size ===")
print(run("grep -r client_max_body_size /etc/nginx/"))

print("\n=== nginx api block ===")
print(run("grep -A4 'location /api' /etc/nginx/sites-available/sphera"))

print("\n=== systemd service active? ===")
print(run("systemctl is-active sphera-reels"))

print("\n=== Last 5 API service log lines ===")
print(run("journalctl -u sphera-reels -n 5 --no-pager 2>&1"))

ssh.close()
