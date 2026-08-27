#!/usr/bin/env python3
"""
Deploy the Reels API to the production server and configure everything.
"""
import paramiko

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"
REMOTE   = "/opt/sphera"
LOCAL    = "/home/kali/.gemini/antigravity/scratch/sphera"

print("\n🔌 Connecting...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
sftp = ssh.open_sftp()

# Upload the API + updated frontend files
for f in ["reels_api.py", "app.js", "index.html"]:
    print(f"  ↑ {f}")
    sftp.put(f"{LOCAL}/{f}", f"{REMOTE}/{f}")
sftp.close()

setup = f"""
set -e

# 1. Install Python deps
pip3 install flask flask-cors werkzeug -q 2>/dev/null || true

# 2. Create dirs
mkdir -p {REMOTE}/uploads {REMOTE}/data
chown -R www-data:www-data {REMOTE}/uploads {REMOTE}/data

# 3. Kill any existing API process
pkill -f reels_api.py 2>/dev/null || true
sleep 1

# 4. Write systemd service
cat > /etc/systemd/system/sphera-reels.service << 'EOF'
[Unit]
Description=SPHERA Reels API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/sphera
ExecStart=/usr/bin/python3 /opt/sphera/reels_api.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sphera-reels
systemctl restart sphera-reels
sleep 2
systemctl status sphera-reels --no-pager | head -6

# 5. Update nginx to proxy /api/ and serve /uploads/
cat > /etc/nginx/sites-available/sphera << 'NGINXEOF'
server {{
    listen 80;
    server_name sphera.expediteconsults.com www.sphera.expediteconsults.com;
    return 301 https://$host$request_uri;
}}

server {{
    listen 443 ssl;
    server_name sphera.expediteconsults.com www.sphera.expediteconsults.com;

    ssl_certificate     /etc/letsencrypt/live/sphera.expediteconsults.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sphera.expediteconsults.com/privkey.pem;

    root /opt/sphera;
    index index.html;

    # Static app
    location / {{
        try_files $uri $uri/ /index.html;
    }}

    # Reels API proxy
    location /api/ {{
        proxy_pass http://127.0.0.1:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 250m;
    }}

    # Uploaded videos
    location /uploads/ {{
        alias /opt/sphera/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }}

    location ~* \\.(png|jpg|jpeg|gif|ico|svg|webp|woff2?)$ {{
        expires 7d;
    }}
}}
NGINXEOF

nginx -t && systemctl reload nginx

# 6. Quick health check
sleep 1
curl -s http://localhost:5050/api/health || echo "API not responding yet"

echo "ALL_DONE"
"""

print("\n⚙️  Setting up server (installing deps, systemd service, nginx)...")
stdin, stdout, stderr = ssh.exec_command(setup, timeout=180)
for line in stdout:
    l = line.strip()
    if l and 'WARNING' not in l and 'DEPRECAT' not in l:
        print(" ", l)

err = stderr.read().decode()
if err:
    for line in err.split('\n'):
        if line.strip() and 'warning' not in line.lower():
            print(" ERR:", line)

ssh.close()
print("\n✅ Reels API deployed!")
