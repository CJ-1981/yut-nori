'use client';

// Sound generation using Web Audio API - no external files needed
// Generates Korean traditional-style sounds programmatically

type SoundType =
  | 'throw'
  | 'stickHit'
  | 'stickLand'
  | 'do'
  | 'gae'
  | 'geol'
  | 'yut'
  | 'mo'
  | 'backdo'
  | 'move'
  | 'capture'
  | 'carry'
  | 'finish'
  | 'win'
  | 'click'
  | 'hover'
  | 'turnStart';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = true;
  private volume = 0.5;
  private musicEnabled = true;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Audio not supported', e);
    }
  }

  setEnabled(v: boolean) {
    this.enabled = v;
  }

  isEnabled() {
    return this.enabled;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  getVolume() {
    return this.volume;
  }

  private now() {
    return this.ctx?.currentTime ?? 0;
  }

  // Play a tone with envelope
  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gain: number = 0.3,
    startTime?: number,
  ) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = startTime ?? this.now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + duration + 0.1);
  }

  // Play a noise burst (for sticks hitting each other)
  private playNoise(duration: number, gain: number = 0.2, filterFreq: number = 2000) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.now();
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    source.start(t);
    source.stop(t + duration);
  }

  // Korean traditional percussion sound (like janggu/buk drum)
  private playDrum(freq: number = 150, duration: number = 0.15, gain: number = 0.4) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 2, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + duration);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  // Play a gong-like sound (Korean traditional)
  private playGong(freq: number = 440, duration: number = 1.5, gain: number = 0.3) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.now();
    // Multiple harmonics for gong-like sound
    [1, 2, 3, 4.2, 5.4].forEach((mult, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * mult, t);
      const subGain = gain * (1 / (i + 1));
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(subGain, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + duration + 0.1);
    });
  }

  // Wood block sound (for stick hits)
  private playWoodBlock(freq: number = 800, gain: number = 0.3) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.05);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Main sound dispatcher
  play(sound: SoundType) {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.enabled) return;

    // Resume audio context if suspended (mobile browsers require user interaction)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    switch (sound) {
      case 'throw':
        // Whoosh + initial release
        this.playNoise(0.3, 0.15, 800);
        this.playTone(200, 0.3, 'sawtooth', 0.1);
        break;
      case 'stickHit':
        // Sticks clattering
        this.playWoodBlock(900 + Math.random() * 300, 0.25);
        setTimeout(() => this.playWoodBlock(700 + Math.random() * 200, 0.2), 60);
        setTimeout(() => this.playWoodBlock(800 + Math.random() * 200, 0.15), 120);
        break;
      case 'stickLand':
        this.playNoise(0.4, 0.25, 1500);
        this.playDrum(100, 0.2, 0.3);
        break;
      case 'do':
        // Single low tone
        this.playTone(330, 0.4, 'sine', 0.3);
        setTimeout(() => this.playTone(220, 0.3, 'sine', 0.2), 100);
        break;
      case 'gae':
        // Two tones
        this.playTone(392, 0.2, 'sine', 0.3);
        setTimeout(() => this.playTone(330, 0.3, 'sine', 0.25), 150);
        break;
      case 'geol':
        // Three ascending tones
        this.playTone(330, 0.15, 'sine', 0.25);
        setTimeout(() => this.playTone(392, 0.15, 'sine', 0.25), 120);
        setTimeout(() => this.playTone(494, 0.3, 'sine', 0.3), 240);
        break;
      case 'yut':
        // Joyful ascending melody
        this.playTone(330, 0.1, 'triangle', 0.3);
        setTimeout(() => this.playTone(415, 0.1, 'triangle', 0.3), 80);
        setTimeout(() => this.playTone(494, 0.1, 'triangle', 0.3), 160);
        setTimeout(() => this.playTone(659, 0.4, 'triangle', 0.4), 240);
        setTimeout(() => this.playGong(330, 1, 0.2), 300);
        break;
      case 'mo':
        // Big celebration - gong + drum
        this.playGong(220, 2, 0.4);
        this.playDrum(80, 0.3, 0.5);
        setTimeout(() => this.playDrum(100, 0.3, 0.4), 200);
        setTimeout(() => {
          this.playTone(440, 0.2, 'triangle', 0.3);
          this.playTone(554, 0.2, 'triangle', 0.3);
          this.playTone(659, 0.4, 'triangle', 0.3);
        }, 400);
        break;
      case 'backdo':
        // Descending tones - "aww" feeling
        this.playTone(440, 0.15, 'sine', 0.25);
        setTimeout(() => this.playTone(330, 0.15, 'sine', 0.25), 120);
        setTimeout(() => this.playTone(220, 0.3, 'sine', 0.25), 240);
        break;
      case 'move':
        // Quick click
        this.playTone(600, 0.08, 'square', 0.15);
        break;
      case 'capture':
        // Capture sound - dramatic
        this.playDrum(120, 0.2, 0.5);
        setTimeout(() => this.playNoise(0.3, 0.3, 1000), 50);
        setTimeout(() => this.playGong(180, 0.8, 0.3), 150);
        break;
      case 'carry':
        // Pleasant chime
        this.playTone(523, 0.1, 'sine', 0.25);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.25), 80);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 160);
        break;
      case 'finish':
        // Victory fanfare
        this.playTone(523, 0.15, 'triangle', 0.3);
        setTimeout(() => this.playTone(659, 0.15, 'triangle', 0.3), 150);
        setTimeout(() => this.playTone(784, 0.15, 'triangle', 0.3), 300);
        setTimeout(() => this.playTone(1047, 0.4, 'triangle', 0.4), 450);
        setTimeout(() => this.playGong(523, 1.5, 0.3), 500);
        break;
      case 'win':
        // Big victory
        this.playGong(330, 2, 0.4);
        setTimeout(() => this.playDrum(80, 0.3, 0.5), 100);
        setTimeout(() => this.playDrum(100, 0.3, 0.4), 300);
        setTimeout(() => this.playDrum(80, 0.3, 0.5), 500);
        // Fanfare
        setTimeout(() => {
          this.playTone(523, 0.15, 'triangle', 0.35);
          setTimeout(() => this.playTone(659, 0.15, 'triangle', 0.35), 150);
          setTimeout(() => this.playTone(784, 0.15, 'triangle', 0.35), 300);
          setTimeout(() => this.playTone(1047, 0.5, 'triangle', 0.45), 450);
        }, 700);
        break;
      case 'click':
        this.playTone(800, 0.05, 'square', 0.15);
        break;
      case 'hover':
        this.playTone(600, 0.03, 'sine', 0.08);
        break;
      case 'turnStart':
        // Subtle chime to indicate turn change
        this.playTone(440, 0.15, 'sine', 0.2);
        setTimeout(() => this.playTone(554, 0.2, 'sine', 0.2), 150);
        break;
    }
  }

  // Background ambient music (very simple loop)
  private musicGain: GainNode | null = null;
  private musicNodes: OscillatorNode[] = [];

  startMusic() {
    if (!this.ctx || !this.musicEnabled) return;
    this.stopMusic();

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.05;
    this.musicGain.connect(this.masterGain!);

    // Simple pentatonic drone (Korean traditional scale: D, Eb, F, G, A, Bb)
    // Using low frequencies for ambient background
    const baseFreqs = [110, 165, 220]; // A2, E3, A3
    baseFreqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.value = 0.3 / (i + 1);
      // Slow LFO for subtle modulation
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.value = 0.1 + i * 0.05;
      lfoGain.gain.value = 2;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      osc.connect(g);
      g.connect(this.musicGain!);
      osc.start();
      this.musicNodes.push(osc, lfo);
    });
  }

  stopMusic() {
    this.musicNodes.forEach((n) => {
      try {
        n.stop();
      } catch {}
    });
    this.musicNodes = [];
    if (this.musicGain) {
      try {
        this.musicGain.disconnect();
      } catch {}
      this.musicGain = null;
    }
  }

  setMusicEnabled(v: boolean) {
    this.musicEnabled = v;
    if (v) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }
}

export const soundManager = new SoundManager();
export type { SoundType };
