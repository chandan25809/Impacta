import '@testing-library/jest-dom';
import { expect } from 'vitest';
global.expect = expect;
// Polyfill for NodeList.prototype.includes in jsdom
if (typeof NodeList !== 'undefined' && !NodeList.prototype.includes) {
  NodeList.prototype.includes = Array.prototype.includes;
}

// Polyfill for matchMedia if needed
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Polyfill for TextEncoder and TextDecoder if not already defined
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Extended canvas polyfill for jsdom
HTMLCanvasElement.prototype.getContext = function(type, opts) {
  if (type === '2d') {
    return {
      fillRect: () => {},
      clearRect: () => {},
      getImageData: (x, y, w, h) => ({ data: new Array(w * h * 4).fill(0) }),
      putImageData: () => {},
      createImageData: () => [],
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      fillText: () => {},
      measureText: (text) => ({ width: text.length * 6 }), // simple approximation
      transform: () => {},
      rect: () => {},
      clip: () => {},
    };
  }
  return null;
};
