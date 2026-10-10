"""Synthesises the 60 s background music bed (public/music.mp3). Usage: python3 scripts/music.py"""
import subprocess, wave
import numpy as np

SR, DUR = 44100, 60.0
N = int(SR * DUR)
BEAT = 60 / 96
L, R = np.zeros(N), np.zeros(N)
rng = np.random.default_rng(7)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)


def add(sig, start, pan=0.5):
    i = int(start * SR)
    n = min(len(sig), N - i)
    if n > 0:
        L[i:i + n] += sig[:n] * (1 - pan) * 1.4
        R[i:i + n] += sig[:n] * pan * 1.4


def tone(f, dur, harm=(1, .4, .2), a=.02, r=.3, decay=0.0):
    x = np.arange(int((dur + r) * SR)) / SR
    s = sum(h * np.sin(2 * np.pi * f * (k + 1) * x) for k, h in enumerate(harm))
    env = np.minimum(1, x / a) * np.where(x < dur, 1, np.exp(-(x - dur) / (r / 4)))
    return s * env * np.exp(-decay * x)


chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]  # C  G  Am  F
CH = 8 * BEAT
for c in range(int(DUR / CH) + 1):
    ch = chords[c % 4]
    for m in ch:  # slow pad, detuned pair for width
        add(tone(hz(m), CH, (1, .3, .12), a=1.0, r=1.0) * .10, c * CH, .35)
        add(tone(hz(m) * 1.004, CH, (1, .3, .12), a=1.0, r=1.0) * .10, c * CH, .65)

for sec_start in (7, 15, 27, 39, 50):  # impact + whoosh on each scene change
    boom = np.sin(2 * np.pi * 52 * np.arange(int(1.4 * SR)) / SR) * np.exp(-np.arange(int(1.4 * SR)) / SR * 3)
    add(boom * .45, sec_start, .5)
    n = int(.9 * SR)
    w = np.convolve(rng.standard_normal(n), np.ones(6) / 6, 'same') * np.hanning(n) * .12
    add(w, sec_start - .45, .5)

eighth = BEAT / 2
for k in range(int((DUR - 7) / eighth)):  # plucked arpeggio from 7 s
    t0 = 7 + k * eighth
    if t0 > 56:
        break
    ch = chords[int(t0 / CH) % 4]
    m = ch[[0, 1, 2, 1, 2, 1, 0, 1][k % 8]] + (24 if 39 <= t0 < 50 and k % 2 else 12)
    p = tone(hz(m), .05, (1, .5, .25, .1), a=.004, r=.7, decay=5) * .13
    add(p, t0, .3 + .4 * (k % 2))
    add(p * .35, t0 + BEAT * .75, .7 - .4 * (k % 2))  # echo

for k in range(int(DUR / BEAT)):
    t0 = k * BEAT
    if t0 < 15 or t0 > 56:
        continue
    ch = chords[int(t0 / CH) % 4]
    x = np.arange(int(.3 * SR)) / SR
    add(np.sin(2 * np.pi * (45 + 90 * np.exp(-x * 30)) * x) * np.exp(-x * 11) * .55, t0, .5)  # kick
    if k % 2:
        n = int(.06 * SR)
        add(rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 70) * .06, t0 + eighth, .6)  # hat
    if k % 2 == 0:
        add(tone(hz(ch[0] - 24), BEAT * 1.8, (1, .25), a=.01, r=.2) * .3, t0, .5)  # bass

m = np.maximum(abs(L).max(), abs(R).max())
fade = np.clip((DUR - np.arange(N) / SR) / 3, 0, 1)
st = np.stack([L, R], 1) / m * .89 * fade[:, None]
with wave.open('/tmp/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/music.wav', '-b:a', '192k', 'public/music.mp3'], check=True)
print('wrote public/music.mp3')
