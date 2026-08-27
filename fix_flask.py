#!/usr/bin/env python3
"""Fix Flask install and systemd service on server"""
import paramiko, time

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)

def run(cmd, timeout=60):
    _, out, err = ssh.exec_command(cmd, timeout=timeout)
    o = out.read().decode().strip()
    e = err.read().decode().strip()
    return o or e

# Step 1: Install flask
print("Installing Flask...")
print(run("pip3 install flask flask-cors werkzeug --break-system-packages -q 2>&1 | tail -3"))

# Step 2: Test
time.sleep(1)
print("Testing import:", run("python3 -c 'import flask; print(flask.__version__)'"))

# Step 3: Create systemd service
print("Creating systemd service...")
service = """[Unit]
Description=SPHERA Reels API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/sphera
ExecStart=/usr/bin/python3 /opt/sphera/reels_api.py
Restart=always
RestartSec=3
StandardOutput=append:/opt/sphera/data/reels_api.log
StandardError=append:/opt/sphera/data/reels_api.log

[Install]
WantedBy=multi-user.target
"""
run(f"cat > /etc/systemd/system/sphera-reels.service << 'SVCEOF'\n{service}\nSVCEOF")

print(run("systemctl daemon-reload"))
print(run("systemctl enable sphera-reels"))
print(run("systemctl restart sphera-reels"))
time.sleep(3)

print("Service status:", run("systemctl is-active sphera-reels"))
print("API health:", run("curl -s http://127.0.0.1:5050/api/health"))

ssh.close()
print("Done!")
