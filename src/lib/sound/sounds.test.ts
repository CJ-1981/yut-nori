import { describe, it, expect, beforeEach, afterEach, mock, jest } from 'bun:test';
import { soundManager, SoundType } from './sounds';

class MockAudioParam {
  value = 0;
  setValueAtTime = mock(() => {});
  linearRampToValueAtTime = mock(() => {});
  exponentialRampToValueAtTime = mock(() => {});
  connect = mock(() => {});
}

class MockGainNode {
  gain = new MockAudioParam();
  connect = mock(() => {});
  disconnect = mock(() => {});
}

class MockOscillatorNode {
  type: OscillatorType = 'sine';
  frequency = new MockAudioParam();
  connect = mock(() => {});
  start = mock(() => {});
  stop = mock(() => {});
}

class MockBiquadFilterNode {
  type: BiquadFilterType = 'lowpass';
  frequency = new MockAudioParam();
  connect = mock(() => {});
}

class MockAudioBufferSourceNode {
  buffer: any = null;
  connect = mock(() => {});
  start = mock(() => {});
  stop = mock(() => {});
}

class MockAudioBuffer {
  sampleRate: number;
  length: number;
  numberOfChannels: number;
  data: Float32Array;

  constructor(options: { length: number; numberOfChannels?: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels || 1;
    this.sampleRate = options.sampleRate;
    this.data = new Float32Array(this.length);
  }

  getChannelData(_channel: number) {
    return this.data;
  }
}

class MockAudioContext {
  destination = {};
  currentTime = 0;
  sampleRate = 44100;
  state: AudioContextState = 'running';

  createGain = mock(() => new MockGainNode());
  createOscillator = mock(() => new MockOscillatorNode());
  createBiquadFilter = mock(() => new MockBiquadFilterNode());
  createBuffer = mock(
    (channels: number, length: number, sampleRate: number) =>
      new MockAudioBuffer({ length, numberOfChannels: channels, sampleRate }),
  );
  createBufferSource = mock(() => new MockAudioBufferSourceNode());
  resume = mock(async () => {
    this.state = 'running';
  });
}

describe('SoundManager', () => {
  let originalWindow: any;
  let mockContext: MockAudioContext;

  beforeEach(() => {
    originalWindow = (globalThis as any).window;
    mockContext = new MockAudioContext();
    const mockAudioContextClass = mock((() => mockContext) as any);

    (globalThis as any).window = {
      AudioContext: mockAudioContextClass,
    };
    (globalThis as any).AudioContext = mockAudioContextClass;

    // Reset soundManager state between tests
    soundManager.setEnabled(true);
    soundManager.setVolume(0.5);
    soundManager.setMusicEnabled(true);
    // Force re-init if needed in test
    (soundManager as any).ctx = null;
    (soundManager as any).masterGain = null;
    (soundManager as any).musicGain = null;
    (soundManager as any).musicNodes = [];
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    delete (globalThis as any).AudioContext;
  });

  it('initializes AudioContext and masterGain correctly', () => {
    soundManager.init();
    expect((globalThis as any).window.AudioContext).toHaveBeenCalled();
    expect(mockContext.createGain).toHaveBeenCalled();
    expect(soundManager.getVolume()).toBe(0.5);

    // Calling init again when ctx already exists should be a no-op
    const callCount = (globalThis as any).window.AudioContext.mock.calls.length;
    soundManager.init();
    expect((globalThis as any).window.AudioContext.mock.calls.length).toBe(callCount);
  });

  it('handles gracefully when AudioContext is unsupported', () => {
    (globalThis as any).window = {};
    delete (globalThis as any).AudioContext;

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    soundManager.init();
    expect(warnSpy).toHaveBeenCalledWith('Audio not supported', expect.any(Error));
    warnSpy.mockRestore();

    // Calling play when init failed should not throw
    expect(() => soundManager.play('click')).not.toThrow();
  });

  it('manages enabled state correctly', () => {
    expect(soundManager.isEnabled()).toBe(true);

    soundManager.setEnabled(false);
    expect(soundManager.isEnabled()).toBe(false);

    soundManager.setEnabled(true);
    expect(soundManager.isEnabled()).toBe(true);
  });

  it('manages volume state and clamps volume correctly', () => {
    soundManager.init();

    soundManager.setVolume(0.8);
    expect(soundManager.getVolume()).toBe(0.8);

    // Clamps values above 1 to 1
    soundManager.setVolume(1.5);
    expect(soundManager.getVolume()).toBe(1);

    // Clamps values below 0 to 0
    soundManager.setVolume(-0.5);
    expect(soundManager.getVolume()).toBe(0);
  });

  it('resumes AudioContext if suspended when playing sound', () => {
    mockContext.state = 'suspended';
    soundManager.init();

    soundManager.play('click');
    expect(mockContext.resume).toHaveBeenCalled();
  });

  it('does not play sound when disabled', () => {
    soundManager.init();
    soundManager.setEnabled(false);

    soundManager.play('click');
    expect(mockContext.createOscillator).not.toHaveBeenCalled();
  });

  const soundTypes: SoundType[] = [
    'throw',
    'stickHit',
    'stickLand',
    'do',
    'gae',
    'geol',
    'yut',
    'mo',
    'backdo',
    'move',
    'capture',
    'carry',
    'finish',
    'win',
    'click',
    'hover',
    'turnStart',
  ];

  soundTypes.forEach((sound) => {
    it(`plays sound type: ${sound}`, () => {
      soundManager.init();
      soundManager.play(sound);

      // Verify at least one node was created (oscillator or buffer source)
      const oscCount = mockContext.createOscillator.mock.calls.length;
      const bufferSourceCount = mockContext.createBufferSource.mock.calls.length;
      expect(oscCount + bufferSourceCount).toBeGreaterThan(0);
    });
  });

  it('manages background music state and nodes', () => {
    soundManager.init();

    expect(soundManager.isMusicEnabled()).toBe(true);

    soundManager.startMusic();
    expect((soundManager as any).musicNodes.length).toBeGreaterThan(0);
    expect((soundManager as any).musicGain).not.toBeNull();

    soundManager.stopMusic();
    expect((soundManager as any).musicNodes.length).toBe(0);
    expect((soundManager as any).musicGain).toBeNull();

    soundManager.setMusicEnabled(false);
    expect(soundManager.isMusicEnabled()).toBe(false);

    soundManager.setMusicEnabled(true);
    expect(soundManager.isMusicEnabled()).toBe(true);
    expect((soundManager as any).musicNodes.length).toBeGreaterThan(0);
  });
});
