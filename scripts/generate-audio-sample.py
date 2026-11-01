import math
import wave
import struct
import subprocess
import os

sample_rate = 44100

def note_freq(semitones_from_a4):
    return 440.0 * (2.0 ** (semitones_from_a4 / 12.0))

# Semitones from A4 (A4 = 0)
# F4 = -4, G4 = -2, A4 = 0, Bb4 = 1, C5 = 3, D5 = 5, E4 = -5
# Handel "Lascia ch'io pianga" opening phrase:
# F4, G4, A4... G4... F4... E4... F4...
melody = [
    (-4, 1.2),   # F4  "Las-"
    (-2, 0.6),   # G4  "-cia"
    (0,  1.8),   # A4  "ch'io"
    (1,  0.8),   # Bb4 "pian-"
    (0,  0.8),   # A4  "-ga"
    (-2, 1.6),   # G4  "la"
    (-4, 0.8),   # F4  "cru-"
    (-5, 0.8),   # E4  "-da"
    (-4, 2.4),   # F4  "sor-te"
    (0,  1.2),   # A4  "e"
    (3,  1.6),   # C5  "che"
    (1,  1.0),   # Bb4 "sos-"
    (0,  1.0),   # A4  "-pi-"
    (-2, 2.5),   # G4  "-ri"
]

total_duration = sum(dur for _, dur in melody) + 2.0
num_samples = int(total_duration * sample_rate)

vocal_signal = [0.0] * num_samples
piano_signal = [0.0] * num_samples

# Synthesize Piano Accompaniment (Chords arpeggiated)
# F major: F2 (-28), C3 (-21), F3 (-16), A3 (-12), C4 (-9)
# C major: C2 (-33), G2 (-26), E3 (-17), G3 (-14), C4 (-9)
# D minor: D2 (-31), A2 (-24), F3 (-16), A3 (-12), D4 (-7)
# Bb major: Bb1 (-34), F2 (-28), D3 (-19), F3 (-16), Bb3 (-10)
chords = [
    (0.0, [-28, -21, -16, -12, -9]),   # F major
    (3.6, [-34, -28, -19, -16, -10]),  # Bb major
    (5.2, [-33, -26, -17, -14, -9]),   # C major
    (8.4, [-28, -21, -16, -12, -9]),   # F major
    (10.8, [-31, -24, -16, -12, -7]),  # D minor
    (13.4, [-33, -26, -17, -14, -9]),  # C major
    (16.0, [-28, -21, -16, -12, -9]),  # F major
]

for chord_time, notes in chords:
    base_idx = int(chord_time * sample_rate)
    for note_offset, note in enumerate(notes):
        note_f = note_freq(note)
        arp_delay = int(note_offset * 0.08 * sample_rate)
        start_idx = base_idx + arp_delay
        note_len = int(4.0 * sample_rate)
        for i in range(note_len):
            idx = start_idx + i
            if idx >= num_samples:
                break
            t = i / sample_rate
            # Piano string model: fundamental + harmonics with decay
            env = math.exp(-t * (1.2 + 0.3 * (note / 12.0)))
            val = (
                0.60 * math.sin(2 * math.pi * note_f * t) +
                0.25 * math.sin(2 * math.pi * 2 * note_f * t) * math.exp(-t * 2.0) +
                0.15 * math.sin(2 * math.pi * 3 * note_f * t) * math.exp(-t * 3.0) +
                0.08 * math.sin(2 * math.pi * 4 * note_f * t) * math.exp(-t * 4.0)
            ) * env * 0.22
            piano_signal[idx] += val

# Synthesize Operatic Vocal Melody with Singer's Formant and Operatic Vibrato
current_time = 0.5
for note, dur in melody:
    target_f = note_freq(note)
    start_idx = int(current_time * sample_rate)
    note_samples = int(dur * sample_rate)
    
    # Formants for classical Italian soprano / tenor vowel [a] / [o]
    # F1 ~ 700Hz, F2 ~ 1100Hz, F3 (Singer's formant) ~ 2800Hz
    for i in range(note_samples):
        idx = start_idx + i
        if idx >= num_samples:
            break
        t_note = i / sample_rate
        
        # Envelope: smooth attack (swell) and soft release
        attack_time = min(0.12, dur * 0.2)
        release_time = min(0.15, dur * 0.25)
        if t_note < attack_time:
            env = 0.5 * (1.0 - math.cos(math.pi * t_note / attack_time))
        elif t_note > dur - release_time:
            env = 0.5 * (1.0 + math.cos(math.pi * (t_note - (dur - release_time)) / release_time))
        else:
            env = 1.0
            
        # Subtle crescendo-decrescendo dynamics
        env *= (0.85 + 0.15 * math.sin(math.pi * t_note / dur))
        
        # Operatic vibrato: develops after initial onset (~0.15s), ~5.5 Hz frequency, ~3.5% pitch depth
        vibrato_ramp = min(1.0, max(0.0, (t_note - 0.15) / 0.25))
        vibrato = vibrato_ramp * 0.035 * math.sin(2 * math.pi * 5.6 * t_note)
        f_instant = target_f * (1.0 + vibrato)
        
        # Amplitude tremolo (natural vocal tract coupling)
        tremolo = 1.0 + vibrato_ramp * 0.08 * math.sin(2 * math.pi * 5.6 * t_note)
        
        # Rich vocal harmonics (1 to 14) shaped by vocal tract formants
        vocal_sample = 0.0
        phase = 2 * math.pi * f_instant * t_note
        for h in range(1, 15):
            h_f = target_f * h
            # Vocal tract acoustic formant filter approximation
            f1_gain = 1.0 / (1.0 + ((h_f - 700.0) / 160.0) ** 2)
            f2_gain = 0.65 / (1.0 + ((h_f - 1150.0) / 220.0) ** 2)
            f3_gain = 0.85 / (1.0 + ((h_f - 2800.0) / 300.0) ** 2) # Singer's formant ring
            gain = (1.0 / h) * 0.35 + f1_gain * 0.45 + f2_gain * 0.35 + f3_gain * 0.55
            vocal_sample += gain * math.sin(h * phase)
            
        vocal_signal[idx] += vocal_sample * env * tremolo * 0.38
        
    current_time += dur

# Mix Vocal + Piano and write temporary WAV
mixed_left = [0.0] * num_samples
mixed_right = [0.0] * num_samples

for i in range(num_samples):
    # Stereo panning: Vocal centered, piano slightly widened
    p_mono = piano_signal[i]
    v_mono = vocal_signal[i]
    mixed_left[i] = v_mono + p_mono * 1.05
    mixed_right[i] = v_mono + p_mono * 0.95

# Normalize to -1.5 dBFS to prevent clipping
max_peak = max(max(abs(l) for l in mixed_left), max(abs(r) for r in mixed_right), 0.001)
scale = 0.84 / max_peak

os.makedirs("assets/audio", exist_ok=True)
raw_wav_path = "assets/audio/temp_raw.wav"

with wave.open(raw_wav_path, 'wb') as wav_file:
    wav_file.setnchannels(2)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    for i in range(num_samples):
        sl = int(max(-32767, min(32767, mixed_left[i] * scale * 32767)))
        sr = int(max(-32767, min(32767, mixed_right[i] * scale * 32767)))
        wav_file.writeframes(struct.pack('<hh', sl, sr))

print(f"Generated raw WAV: {raw_wav_path}, duration={total_duration:.2f}s")
