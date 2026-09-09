import '@testing-library/jest-dom/vitest'

// Polyfill DOMMatrix for PDF.js in JSDOM / Node environment
if (typeof window !== 'undefined' && !window.DOMMatrix) {
  // @ts-expect-error polyfill for jsdom
  window.DOMMatrix = class DOMMatrix {
    a = 1
    b = 0
    c = 0
    d = 1
    e = 0
    f = 0
  }
}
if (
  typeof globalThis !== 'undefined' &&
  !(globalThis as unknown as { DOMMatrix?: unknown }).DOMMatrix
) {
  ;(globalThis as unknown as { DOMMatrix: unknown }).DOMMatrix = class DOMMatrix {
    a = 1
    b = 0
    c = 0
    d = 1
    e = 0
    f = 0
  }
}
