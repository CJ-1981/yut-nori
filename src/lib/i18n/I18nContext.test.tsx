import '../../test-setup';
import React from 'react';
import { render, screen, act, renderHook, cleanup } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { I18nProvider, useI18n } from './I18nContext';

// Helper component to display current language and trigger language changes
function TestComponent() {
  const { lang, setLang, t } = useI18n();
  return (
    <div>
      <span data-testid="current-lang">{lang}</span>
      <span data-testid="translated-text">{t('title')}</span>
      <button data-testid="change-ko" onClick={() => setLang('ko')}>
        Set KO
      </button>
      <button data-testid="change-ja" onClick={() => setLang('ja')}>
        Set JA
      </button>
    </div>
  );
}

describe('I18nContext', () => {
  let storageProto: Storage;
  let origGetItem: Storage['getItem'];
  let origSetItem: Storage['setItem'];

  beforeEach(() => {
    storageProto = Object.getPrototypeOf(localStorage);
    origGetItem = storageProto.getItem;
    origSetItem = storageProto.setItem;
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    storageProto.getItem = origGetItem;
    storageProto.setItem = origSetItem;
    localStorage.clear();
  });

  test('initializes with default language ("en") when localStorage is empty', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
  });

  test('loads saved language from localStorage on mount after microtask', async () => {
    localStorage.setItem('yutnori-lang', 'ko');

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('ko');
  });

  test('ignores invalid language string in localStorage', async () => {
    localStorage.setItem('yutnori-lang', 'invalid-lang');

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
  });

  test('handles error gracefully when localStorage.getItem throws an exception (e.g., disabled cookies)', async () => {
    storageProto.getItem = () => {
      throw new Error('SecurityError: The operation is insecure.');
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
  });

  test('updates language state and saves to localStorage when setLang is called', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    act(() => {
      screen.getByTestId('change-ko').click();
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('ko');
    expect(localStorage.getItem('yutnori-lang')).toBe('ko');
  });

  test('handles error gracefully when localStorage.setItem throws an exception (e.g., QuotaExceededError)', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    storageProto.setItem = () => {
      throw new Error('DOMException: QuotaExceededError');
    };

    act(() => {
      screen.getByTestId('change-ja').click();
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('ja');
  });

  test('throws error when useI18n is used outside I18nProvider', () => {
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      expect(() => {
        renderHook(() => useI18n());
      }).toThrow('useI18n must be used within I18nProvider');
    } finally {
      console.error = originalConsoleError;
    }
  });

  test('t function returns translation key fallback for unknown keys', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>,
    });

    const unknownKey = 'non_existent_key' as any;
    expect(result.current.t(unknownKey)).toBe('non_existent_key');
  });
});
