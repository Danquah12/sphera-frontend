#!/usr/bin/env python3
"""Debug and fix the Flask API on the server"""
import paramiko

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)

def run(cmd, timeout=30):
    _, out, err = ssh.exec_command(cmd, timeout=timeout)
    o = out.read().decode().strip()
    e = err.read().decode().strip()
    return o or e

# Check what's happening
print("=== Systemd status ===")
print(run("systemctl status sphera-reels --no-pager 2>&1 | head -15"))

print("\n=== Test API directly ===")
print(run("curl -s http://127.0.0.1:5050/api/health 2>&1"))

print("\n=== Install flask if missing ===")
print(run("pip3 install flask flask-cors -q 2>&1 | tail -3"))

print("\n=== Try starting manually ===")
run("pkill -f reels_api.py 2>/dev/null; true")
import time; time.sleep(1)
run("nohup python3 /opt/sphera/reels_api.py > /opt/sphera/data/reels_api.log 2>&1 &")
time.sleep(3)

print(run("curl -s http://127.0.0.1:5050/api/health 2>&1"))
print("\n=== API Log ===")
print(run("cat /opt/sphera/data/reels_api.log 2>&1 | tail -10"))

# If it's working now, re-enable systemd
print("\n=== Restart systemd service ===")
run("systemctl restart sphera-reels 2>&1")
time.sleep(2)
print(run("systemctl is-active sphera-reels"))
print(run("curl -s http://127.0.0.1:5050/api/health"))

ssh.close()
