import '@testing-library/jest-dom';

// Polyfill for NodeList.prototype.includes in jsdom
if (typeof NodeList !== 'undefined' && !NodeList.prototype.includes) {
  NodeList.prototype.includes = Array.prototype.includes;
}

// Existing polyfill for matchMedia, etc.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: '',
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
