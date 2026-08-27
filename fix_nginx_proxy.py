#!/usr/bin/env python3
"""Write nginx config via SFTP (no heredoc) and reload"""
import paramiko, io, time

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"

NGINX_CONF = """\
server {
    listen 80;
    server_name sphera.expediteconsults.com www.sphera.expediteconsults.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name sphera.expediteconsults.com www.sphera.expediteconsults.com;

    ssl_certificate     /etc/letsencrypt/live/sphera.expediteconsults.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sphera.expediteconsults.com/privkey.pem;

    root /opt/sphera;
    index index.html;

    client_max_body_size 250m;

    # Reels API — MUST come before location / 
    location /api/ {
        proxy_pass http://127.0.0.1:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 120s;
    }

    # Uploaded videos
    location /uploads/ {
        alias /opt/sphera/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Static app (last resort)
    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(png|jpg|jpeg|gif|ico|svg|webp|woff2?)$ {
        expires 7d;
    }
}
"""

print("Connecting...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
sftp = ssh.open_sftp()

# Write nginx config via SFTP
print("Writing nginx config via SFTP...")
with sftp.file('/etc/nginx/sites-available/sphera', 'w') as f:
    f.write(NGINX_CONF)
sftp.close()

def run(cmd, timeout=30):
    _, o, e = ssh.exec_command(cmd, timeout=timeout)
    return (o.read().decode() + e.read().decode()).strip()

# Ensure data dir exists with correct permissions
print(run("mkdir -p /opt/sphera/data /opt/sphera/uploads"))
print(run("chmod 777 /opt/sphera/data /opt/sphera/uploads"))

# Test and reload nginx
print("Testing nginx config...")
print(run("nginx -t 2>&1"))
print(run("systemctl reload nginx"))

time.sleep(2)

# Test proxy
print("\nTesting /api/health via domain:")
print(run("curl -sk https://sphera.expediteconsults.com/api/health 2>&1"))

# Test a small upload via curl
print("\nTest POST upload:")
print(run("curl -sk -X POST https://sphera.expediteconsults.com/api/reels/upload "
          "-F 'video=@/opt/sphera/test_reel.mp4' -F 'username=TestUser' -F 'caption=Test Reel' 2>&1"))

# Check reels saved
print("\nReels JSON after test upload:")
print(run("cat /opt/sphera/data/reels.json 2>&1"))

ssh.close()
print("\nDone!")
