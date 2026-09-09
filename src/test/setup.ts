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

// Polyfill Iterator for PDF.js in Node < 22 / JSDOM environment
class PolyfillIterator {
  static from<T>(iterable: Iterable<T> | Iterator<T>) {
    if (iterable && typeof (iterable as Iterable<T>)[Symbol.iterator] === 'function') {
      return (iterable as Iterable<T>)[Symbol.iterator]()
    }
    return iterable
  }
}

if (
  typeof globalThis !== 'undefined' &&
  !(globalThis as unknown as { Iterator?: unknown }).Iterator
) {
  ;(globalThis as unknown as { Iterator: unknown }).Iterator = PolyfillIterator
}
if (typeof window !== 'undefined' && !(window as unknown as { Iterator?: unknown }).Iterator) {
  ;(window as unknown as { Iterator: unknown }).Iterator = PolyfillIterator
}
