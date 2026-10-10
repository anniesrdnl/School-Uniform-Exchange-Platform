#!/usr/bin/env bash
# Voice polish used for every recording: rumble cut, light noise reduction, de-ess, presence EQ, gentle compression, loudness match.
# Usage: scripts/vo.sh <input> <output.mp3> [trim_start_s] [trim_end_s] [tempo, e.g. 1.1 to speed up without changing pitch]
in="$1"; out="$2"; ss="${3:-0}"; to="${4:-}"; tempo="${5:-1}"
trim="atrim=start=${ss}${to:+:end=$to},asetpts=PTS-STARTPTS,atempo=${tempo}"
ffmpeg -y -loglevel error -i "$in" -vn -af "$trim,highpass=f=80,afftdn=nr=10:nf=-40,deesser=i=0.3,equalizer=f=140:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1:g=2,acompressor=threshold=-22dB:ratio=3:attack=8:release=160:makeup=3,loudnorm=I=-16:TP=-1.5:LRA=7" -ar 44100 -ac 2 -b:a 192k "$out"
