#!/bin/bash
# Serve SPHERA frontend on port 3000
echo "🌐 Opening SPHERA at http://localhost:3000"
cd /home/kali/.gemini/antigravity/scratch/sphera
python3 -m http.server 3000
