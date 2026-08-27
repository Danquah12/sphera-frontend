#!/bin/bash
# deploy_anchor_update.sh — Deploy the anchor presenter + social sharing update to the server
# Run this once the SSH ban lifts (usually 10-15 minutes)
# Usage: bash deploy_anchor_update.sh

SERVER="root@203.161.52.21"
SPHERA_DIR="/home/kali/.gemini/antigravity/scratch/sphera"

echo "📦 Uploading files to server..."
scp "$SPHERA_DIR/app.js"                                          "$SERVER:/opt/sphera/app.js"
scp "$SPHERA_DIR/index.html"                                      "$SERVER:/opt/sphera/index.html"
scp "$SPHERA_DIR/backend/routers/video.py"                       "$SERVER:/opt/sphera/backend/routers/video.py"
scp "$SPHERA_DIR/story-renderer/src/StoryAnchor.js"              "$SERVER:/opt/sphera/story-renderer/src/StoryAnchor.js"
scp "$SPHERA_DIR/story-renderer/src/Root.js"                     "$SERVER:/opt/sphera/story-renderer/src/Root.js"
scp "$SPHERA_DIR/story-renderer/render.js"                       "$SERVER:/opt/sphera/story-renderer/render.js"

echo "🔄 Updating Docker container..."
ssh "$SERVER" "
  docker cp /opt/sphera/backend/routers/video.py sphera-backend-1:/app/routers/video.py &&
  docker restart sphera-backend-1 &&
  pgrep -f 'node.*server.js' || nohup node /opt/sphera/story-renderer/server.js > /var/log/sphera-renderer.log 2>&1 &
  echo '✅ Deploy complete!'
"
