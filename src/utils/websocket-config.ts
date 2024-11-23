// src/utils/websocket-config.ts
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// Set up polyfills for SockJS in browser environment
if (typeof window !== 'undefined') {
  // Global object polyfill
  (window as any).global = window;
  
  // Process polyfill
  (window as any).process = {
    env: { DEBUG: undefined },
    version: '',
    nextTick: require('next-tick')
  };
  
  // Buffer polyfill
  (window as any).Buffer = require('buffer').Buffer;
}

export const SOCKET_URL = 'http://localhost:8080/websocket';

export const createStompClient = () => {
  const socket = new SockJS(SOCKET_URL);
  const stompClient = Stomp.over(socket);

  // Disable debug logs in production
  if (process.env.NODE_ENV === 'production') {
    stompClient.debug = () => {};
  } else {
    stompClient.debug = (str) => {
      console.log('STOMP:', str);
    };
  }

  return stompClient;
};