// src/utils/sockjs-polyfills.ts
import * as buffer from 'buffer';

if (typeof window !== 'undefined') {
  // Simple nextTick polyfill using setTimeout
  const nextTick = (callback: (...args: any[]) => void, ...args: any[]) => {
    setTimeout(() => callback(...args), 0);
  };

  // Add required globals
  const globals = {
    global: window,
    process: {
      env: { DEBUG: undefined },
      version: '',
      nextTick: nextTick,
    },
    Buffer: buffer.Buffer,
  };

  Object.entries(globals).forEach(([key, value]) => {
    if (!(key in window)) {
      (window as any)[key] = value;
    }
  });
}