#!/usr/bin/env python3
"""
SPHERA Production Deployment Script
Uploads all static files to /opt/sphera on the server
and ensures nginx is configured and running.
"""
import paramiko
import os
import sys

SERVER   = "203.161.52.21"
PORT     = 22
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"
LOCAL    = "/home/kali/.gemini/antigravity/scratch/sphera"
REMOTE   = "/opt/sphera"

# Files/dirs to skip
SKIP = {
    '__pycache__', '.git', 'node_modules', '.env',
    'sphera.db', 'deploy_now.py', 'story-renderer',
    'backend',  # skip backend for now — frontend only
}

SKIP_EXT = {'.pyc', '.log', '.sh'}

def should_skip(name):
    if name in SKIP:
        return True
    _, ext = os.path.splitext(name)
    if ext in SKIP_EXT:
        return True
    return False

print(f"\n🚀 Connecting to {SERVER}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, port=PORT, username=USER, password=PASSWORD, timeout=30)
print("✅ Connected!")

# Create remote directory
ssh.exec_command(f"mkdir -p {REMOTE}")

sftp = ssh.open_sftp()

def upload_dir(local_path, remote_path):
    try:
        sftp.stat(remote_path)
    except FileNotFoundError:
        sftp.mkdir(remote_path)
    
    for item in os.listdir(local_path):
        if should_skip(item):
            continue
        local_item  = os.path.join(local_path, item)
        remote_item = remote_path + '/' + item
        if os.path.isdir(local_item):
            upload_dir(local_item, remote_item)
        else:
            print(f"  ↑ {remote_item}")
            sftp.put(local_item, remote_item)

print(f"\n📦 Uploading SPHERA files to {REMOTE}...\n")
upload_dir(LOCAL, REMOTE)
sftp.close()

print("\n⚙️  Configuring nginx on server...")

nginx_config = r"""
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /opt/sphera;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(png|jpg|jpeg|gif|ico|svg|mp4|webp|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
"""

setup_commands = f"""
set -e
# Install nginx if not present
apt-get update -qq && apt-get install -y nginx -qq

# Write nginx config
cat > /etc/nginx/sites-available/sphera << 'NGINXEOF'
{nginx_config}
NGINXEOF

# Enable the site
ln -sf /etc/nginx/sites-available/sphera /etc/nginx/sites-enabled/sphera
rm -f /etc/nginx/sites-enabled/default

# Set permissions
chown -R www-data:www-data {REMOTE}
chmod -R 755 {REMOTE}

# Test and reload nginx
nginx -t && systemctl restart nginx && systemctl enable nginx

# Allow HTTP through firewall
ufw allow 80/tcp
ufw allow 443/tcp

echo "DONE"
"""

stdin, stdout, stderr = ssh.exec_command(setup_commands, timeout=120)
out = stdout.read().decode()
err = stderr.read().decode()

if 'DONE' in out:
    print("✅ Nginx configured and running!")
else:
    print("Output:", out[-500:] if out else "(none)")
    if err:
        print("Errors:", err[-300:])

# Final check
_, chk_out, _ = ssh.exec_command("systemctl is-active nginx && curl -s -o /dev/null -w '%{http_code}' http://localhost/")
status = chk_out.read().decode().strip()
print(f"\n🌐 Nginx status: {status}")

ssh.close()
print(f"\n✅ SPHERA is live at: http://{SERVER}/")
print("   Open in your browser to verify!\n")
