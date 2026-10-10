#!/usr/bin/env bash
# Voice polish used for every recording: rumble cut, light noise reduction, de-ess, presence EQ, gentle compression, loudness match.
# Usage: scripts/vo.sh <input> <output.mp3> [trim_start_s] [trim_end_s] [tempo, e.g. 1.1 to speed up without changing pitch]
in="$1"; out="$2"; ss="${3:-0}"; to="${4:-}"; tempo="${5:-1}"
# Set STRONG_DENOISE=1 for recordings with background noise: removes low-frequency rumble and 60 Hz mains hum (with harmonics),
# then learns the remaining broadband noise from the recording, band-limits, and gates the gaps between words
if [ -n "$STRONG_DENOISE" ]; then DN="highpass=f=100,highpass=f=100,bandreject=f=60:width_type=h:w=8,bandreject=f=120:width_type=h:w=10,bandreject=f=180:width_type=h:w=12,lowpass=f=9000,afftdn=nr=24:nf=-50:tn=1,agate=threshold=0.025:ratio=8:attack=5:release=260:range=0.04"; else DN="afftdn=nr=10:nf=-40"; fi
trim="atrim=start=${ss}${to:+:end=$to},asetpts=PTS-STARTPTS,atempo=${tempo}"
ffmpeg -y -loglevel error -i "$in" -vn -af "$trim,highpass=f=80,${DN},deesser=i=0.3,equalizer=f=140:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1:g=2,acompressor=threshold=-22dB:ratio=3:attack=8:release=160:makeup=3,loudnorm=I=-16:TP=-1.5:LRA=7" -ar 44100 -ac 2 -b:a 192k "$out"
