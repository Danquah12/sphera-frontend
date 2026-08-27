#!/bin/bash
# generate_audio.sh — Create 4 ambient background music tracks using FFmpeg
set -e

mkdir -p /opt/sphera/static/audio

echo "Generating cinematic.mp3..."
ffmpeg -y -f lavfi \
  -i "aevalsrc=0.18*sin(110*t*2*PI)+0.12*sin(220*t*2*PI)+0.08*sin(164.81*t*2*PI)+0.06*sin(329.63*t*2*PI)+0.15*sin(55*t*2*PI)*sin(0.1*t*2*PI):s=44100:duration=90" \
  -af "aecho=0.85:0.92:1200:0.6,aecho=0.7:0.85:600:0.4,afade=t=in:st=0:d=3,afade=t=out:st=87:d=3,lowpass=f=1200,volume=0.5" \
  -c:a libmp3lame -q:a 4 /opt/sphera/static/audio/cinematic.mp3 2>/dev/null
echo "  ✅ cinematic.mp3"

echo "Generating inspire.mp3..."
ffmpeg -y -f lavfi \
  -i "aevalsrc=(0.2*sin(261.63*t*2*PI)+0.15*sin(329.63*t*2*PI)+0.12*sin(392*t*2*PI))*max(0,sin(0.5*t*2*PI))+0.08*sin(196*t*2*PI)*max(0,sin(0.25*t*2*PI)):s=44100:duration=90" \
  -af "aecho=0.75:0.85:300:0.4,afade=t=in:st=0:d=3,afade=t=out:st=87:d=3,volume=0.5" \
  -c:a libmp3lame -q:a 4 /opt/sphera/static/audio/inspire.mp3 2>/dev/null
echo "  ✅ inspire.mp3"

echo "Generating upbeat.mp3..."
ffmpeg -y -f lavfi \
  -i "aevalsrc=(0.25*sin(392*t*2*PI)+0.2*sin(587.33*t*2*PI))*step(fmod(t,0.5),0.05)+(0.15*sin(493.88*t*2*PI))*step(fmod(t+0.25,0.5),0.05)+0.12*sin(196*t*2*PI)*step(fmod(t,1),0.1):s=44100:duration=90" \
  -af "aecho=0.6:0.7:80:0.3,afade=t=in:st=0:d=2,afade=t=out:st=88:d=2,volume=0.4" \
  -c:a libmp3lame -q:a 4 /opt/sphera/static/audio/upbeat.mp3 2>/dev/null
echo "  ✅ upbeat.mp3"

echo "Generating documentary.mp3..."
ffmpeg -y -f lavfi \
  -i "aevalsrc=(0.22*sin(146.83*t*2*PI)+0.08*sin(293.66*t*2*PI)+0.05*sin(440.99*t*2*PI))*sin(0.18*t*2*PI)+0.15*sin(220*t*2*PI)*sin(0.12*t*2*PI):s=44100:duration=90" \
  -af "aecho=0.88:0.94:1800:0.7,aecho=0.7:0.8:900:0.5,afade=t=in:st=0:d=4,afade=t=out:st=86:d=4,lowpass=f=900,volume=0.6" \
  -c:a libmp3lame -q:a 4 /opt/sphera/static/audio/documentary.mp3 2>/dev/null
echo "  ✅ documentary.mp3"

echo ""
ls -lh /opt/sphera/static/audio/
echo "Done!"
