import { describe, test, expect, beforeEach, afterEach, spyOn, mock } from 'bun:test';
import { SoundManager, soundManager } from './sounds';

function createMockGainNode() {
  return {
    gain: {
      value: 1,
      setValueAtTime: mock(() => {}),
      linearRampToValueAtTime: mock(() => {}),
      exponentialRampToValueAtTime: mock(() => {}),
    },
    connect: mock(() => {}),
    disconnect: mock(() => {}),
  };
}

function createMockOscillatorNode() {
  return {
    type: 'sine',
    frequency: {
      value: 440,
      setValueAtTime: mock(() => {}),
      exponentialRampToValueAtTime: mock(() => {}),
      connect: mock(() => {}),
    },
    connect: mock(() => {}),
    start: mock(() => {}),
    stop: mock(() => {}),
  };
}

function createMockAudioContext() {
  return {
    currentTime: 0,
    sampleRate: 44100,
    state: 'running',
    destination: {},
    createGain: mock(() => createMockGainNode()),
    createOscillator: mock(() => createMockOscillatorNode()),
    createBuffer: mock((channels: number, length: number) => ({
      getChannelData: mock(() => new Float32Array(length)),
    })),
    createBufferSource: mock(() => ({
      buffer: null,
      connect: mock(() => {}),
      start: mock(() => {}),
      stop: mock(() => {}),
    })),
    createBiquadFilter: mock(() => ({
      type: 'lowpass',
      frequency: { value: 1000 },
      connect: mock(() => {}),
    })),
    resume: mock(() => Promise.resolve()),
  };
}

describe('SoundManager', () => {
  let originalWindow: typeof globalThis.window;
  let originalConsoleWarn: typeof console.warn;

  beforeEach(() => {
    // Save original globals
    originalWindow = globalThis.window;
    originalConsoleWarn = console.warn;
  });

  afterEach(() => {
    // Restore original globals
    globalThis.window = originalWindow;
    console.warn = originalConsoleWarn;
  });

  describe('AudioContext initialization and error handling', () => {
    test('should catch error when AudioContext constructor throws and log warning', () => {
      const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});
      const audioError = new Error('AudioContext creation failed due to security policy');

      globalThis.window = {
        AudioContext: function () {
          throw audioError;
        },
      } as any;

      const manager = new SoundManager();
      manager.init();

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('Audio not supported', audioError);
    });

    test('should catch error when webkitAudioContext constructor throws and log warning', () => {
      const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});
      const webkitError = new Error('webkitAudioContext error');

      globalThis.window = {
        AudioContext: undefined,
        webkitAudioContext: function () {
          throw webkitError;
        },
      } as any;

      const manager = new SoundManager();
      manager.init();

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('Audio not supported', webkitError);
    });

    test('should catch error when neither AudioContext nor webkitAudioContext is available', () => {
      const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});

      globalThis.window = {
        AudioContext: undefined,
        webkitAudioContext: undefined,
      } as any;

      const manager = new SoundManager();
      manager.init();

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toBe('Audio not supported');
    });

    test('should not crash when play() is called after failed initialization', () => {
      spyOn(console, 'warn').mockImplementation(() => {});

      globalThis.window = {
        AudioContext: function () {
          throw new Error('Not allowed');
        },
      } as any;

      const manager = new SoundManager();
      expect(() => manager.play('click')).not.toThrow();
      expect(() => manager.play('throw')).not.toThrow();
      expect(() => manager.startMusic()).not.toThrow();
      expect(() => manager.stopMusic()).not.toThrow();
      expect(() => manager.setVolume(0.8)).not.toThrow();
    });

    test('should successfully initialize when AudioContext is supported', () => {
      const mockCtx = createMockAudioContext();
      globalThis.window = {
        AudioContext: function () {
          return mockCtx;
        },
      } as any;

      const manager = new SoundManager();
      manager.init();

      expect(mockCtx.createGain).toHaveBeenCalled();
    });

    test('should fall back to webkitAudioContext when AudioContext is missing', () => {
      const mockCtx = createMockAudioContext();
      globalThis.window = {
        AudioContext: undefined,
        webkitAudioContext: function () {
          return mockCtx;
        },
      } as any;

      const manager = new SoundManager();
      manager.init();

      expect(mockCtx.createGain).toHaveBeenCalled();
    });

    test('should be idempotent and not re-initialize if already initialized', () => {
      let createCount = 0;
      const mockCtx = createMockAudioContext();

      globalThis.window = {
        AudioContext: function () {
          createCount++;
          return mockCtx;
        },
      } as any;

      const manager = new SoundManager();
      manager.init();
      manager.init();

      expect(createCount).toBe(1);
    });
  });

  describe('Sound play operations and volume controls', () => {
    test('should toggle sound enabled state and set/get volume', () => {
      const manager = new SoundManager();
      expect(manager.isEnabled()).toBe(true);

      manager.setEnabled(false);
      expect(manager.isEnabled()).toBe(false);

      manager.setVolume(0.8);
      expect(manager.getVolume()).toBe(0.8);

      // Clamp volume between 0 and 1
      manager.setVolume(-0.5);
      expect(manager.getVolume()).toBe(0);

      manager.setVolume(1.5);
      expect(manager.getVolume()).toBe(1);
    });

    test('should resume audio context if suspended when play() is called', () => {
      const mockCtx = createMockAudioContext();
      mockCtx.state = 'suspended';

      globalThis.window = {
        AudioContext: function () {
          return mockCtx;
        },
      } as any;

      const manager = new SoundManager();
      manager.init();
      manager.play('click');

      expect(mockCtx.resume).toHaveBeenCalled();
    });

    test('should toggle music enabled state', () => {
      const mockCtx = createMockAudioContext();
      globalThis.window = {
        AudioContext: function () {
          return mockCtx;
        },
      } as any;

      const manager = new SoundManager();
      manager.init();

      expect(manager.isMusicEnabled()).toBe(true);
      manager.setMusicEnabled(false);
      expect(manager.isMusicEnabled()).toBe(false);
    });
  });

  describe('Exported singleton instance', () => {
    test('soundManager instance exists', () => {
      expect(soundManager).toBeDefined();
      expect(soundManager instanceof SoundManager).toBe(true);
    });
  });
});
