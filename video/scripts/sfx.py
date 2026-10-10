"""Synthesises the UI sound effects in public/sfx/*.wav. Usage: python3 scripts/sfx.py"""
import wave
import numpy as np

SR = 44100
rng = np.random.default_rng(3)
t = lambda d: np.arange(int(d * SR)) / SR


def save(name, x, gain=0.8):
    x = x / max(1e-9, abs(x).max()) * gain
    with wave.open(f"public/sfx/{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


def click():
    x = t(.12)
    noise = np.convolve(rng.standard_normal(len(x)), [1, -1], "same") * np.exp(-x * 220)
    return noise * .5 + np.sin(2 * np.pi * 1100 * x) * np.exp(-x * 60)


def tick():
    x = t(.06)
    return np.sin(2 * np.pi * 1800 * x) * np.exp(-x * 120) * .6 + rng.standard_normal(len(x)) * np.exp(-x * 300) * .2


def typing():
    out = np.zeros(int(3 * SR))
    for k in range(int(3 / (2 / 30))):
        s = int((k * 2 / 30 + rng.uniform(-.008, .008)) * SR)
        s = max(0, s)
        x = t(.05)
        tk = (np.sin(2 * np.pi * rng.uniform(1500, 2300) * x) * np.exp(-x * 150) + rng.standard_normal(len(x)) * np.exp(-x * 250) * .4) * rng.uniform(.5, 1)
        out[s:s + len(tk)] += tk[:len(out) - s]
    return out


def thud():
    x = t(.35)
    return np.sin(2 * np.pi * (140 * np.exp(-x * 9) + 45) * x) * np.exp(-x * 14)


def pop():
    x = t(.18)
    return np.sin(2 * np.pi * (500 + 1400 * x) * x) * np.exp(-x * 28)


def chime():
    out = np.zeros(int(1.4 * SR))
    for i, f in enumerate([659.25, 783.99, 1046.5]):  # E5 G5 C6
        x = t(1.1)
        n = (np.sin(2 * np.pi * f * x) + .3 * np.sin(2 * np.pi * f * 2 * x)) * np.exp(-x * 4.5) * np.minimum(1, x / .004)
        s = int(i * .09 * SR)
        out[s:s + len(n)] += n[:len(out) - s]
    return out


for n, f in [("click", click), ("tick", tick), ("typing", typing), ("thud", thud), ("pop", pop), ("chime", chime)]:
    save(n, f())
print("sfx done")
