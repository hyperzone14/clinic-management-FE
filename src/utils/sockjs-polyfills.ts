// src/utils/sockjs-polyfills.ts
import * as buffer from 'buffer';

if (typeof window !== 'undefined') {
  // Add required globals
  const globals = {
    global: window,
    process: {
      env: { DEBUG: undefined },
      version: '',
      nextTick: require('next-tick'),
    },
    Buffer: buffer.Buffer,
  };

  Object.entries(globals).forEach(([key, value]) => {
    if (!(key in window)) {
      (window as any)[key] = value;
    }
  });
}