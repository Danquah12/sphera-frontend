#!/usr/bin/env python3
"""Install Flask via apt and restart Reels API"""
import paramiko, time

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)

def run(cmd, timeout=90):
    _, out, err = ssh.exec_command(cmd, timeout=timeout)
    return (out.read().decode() + err.read().decode()).strip()

# Install flask via apt (Ubuntu 24 way)
print("Installing python3-flask via apt...")
print(run("apt-get install -y python3-flask python3-werkzeug 2>&1 | tail -5"))

# Test
print("\nTest:", run("python3 -c 'import flask; print(\"Flask\", flask.__version__)'"))

# Restart service
print("\nRestarting service...")
print(run("systemctl restart sphera-reels"))
time.sleep(4)
print("Status:", run("systemctl is-active sphera-reels"))

# Check health
health = run("curl -s http://127.0.0.1:5050/api/health")
print("Health:", health)

# If still failing, check log
if "ok" not in health.lower():
    print("\nService log:")
    print(run("journalctl -u sphera-reels -n 20 --no-pager 2>&1"))

ssh.close()
print("Done!")
