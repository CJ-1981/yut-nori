import { GlobalWindow } from 'happy-dom';

const window = new GlobalWindow();
globalThis.window = window as unknown as Window & typeof globalThis;
globalThis.document = window.document as unknown as Document;
globalThis.localStorage = window.localStorage;
globalThis.navigator = window.navigator as unknown as Navigator;
globalThis.HTMLElement = window.HTMLElement as unknown as typeof HTMLElement;
globalThis.Element = window.Element as unknown as typeof Element;
globalThis.Node = window.Node as unknown as typeof Node;
globalThis.MutationObserver = window.MutationObserver as unknown as typeof MutationObserver;
globalThis.queueMicrotask = window.queueMicrotask.bind(window);
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
