#!/usr/bin/env python3
"""
Fix SPHERA nginx config for domain + SSL
"""
import paramiko

SERVER   = "203.161.52.21"
USER     = "root"
PASSWORD = "U3Wku07Xv29dUNrI1g"
DOMAIN   = "sphera.expediteconsults.com"
REMOTE   = "/opt/sphera"

print(f"\n🔌 Connecting to {SERVER}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
print("✅ Connected!\n")

commands = f"""
set -e

# 1. Write correct nginx config with domain name
cat > /etc/nginx/sites-available/sphera << 'EOF'
server {{
    listen 80;
    listen [::]:80;
    server_name {DOMAIN} www.{DOMAIN};

    root {REMOTE};
    index index.html;

    location / {{
        try_files $uri $uri/ /index.html;
    }}

    location ~* \\.(png|jpg|jpeg|gif|ico|svg|mp4|webp|woff2?)$ {{
        expires 7d;
        add_header Cache-Control "public";
    }}
}}
EOF

# 2. Enable site, disable default
ln -sf /etc/nginx/sites-available/sphera /etc/nginx/sites-enabled/sphera
rm -f /etc/nginx/sites-enabled/default

# 3. Set correct ownership
chown -R www-data:www-data {REMOTE}
chmod -R 755 {REMOTE}

# 4. Test nginx config
nginx -t

# 5. Restart nginx
systemctl restart nginx

echo "HTTP_DONE"

# 6. Install certbot if missing
apt-get install -y certbot python3-certbot-nginx -qq 2>/dev/null || true

# 7. Get SSL cert for domain
certbot --nginx -d {DOMAIN} --non-interactive --agree-tos -m admin@expediteconsults.com --redirect 2>&1 | tail -5 || echo "CERT_SKIPPED"

echo "SSL_DONE"
"""

print("⚙️  Updating nginx config and setting up SSL...")
stdin, stdout, stderr = ssh.exec_command(commands, timeout=180)

for line in stdout:
    l = line.strip()
    if l:
        print(" ", l)

err = stderr.read().decode()
if err and 'warning' not in err.lower():
    print("STDERR:", err[-400:])

# Verify
print("\n🔍 Verifying deployment...")
_, out, _ = ssh.exec_command(
    f'systemctl is-active nginx && '
    f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost/ && echo ""'
)
result = out.read().decode().strip()
print(f"  nginx: active, HTTP status: {result}")

_, out2, _ = ssh.exec_command(
    f'curl -s -o /dev/null -w "%{{http_code}}" -L https://{DOMAIN}/ 2>/dev/null || echo "SSL_NOT_YET"'
)
https_status = out2.read().decode().strip()
print(f"  https://{DOMAIN}/ → {https_status}")

ssh.close()
print(f"\n✅ Done! Visit: https://{DOMAIN}/\n")
