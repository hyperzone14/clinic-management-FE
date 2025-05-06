// utils/websocket-config.ts
import { CompatClient, Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const createStompClient = (): CompatClient => {
  // Add full URL including port
  const socket = new SockJS(
    "https://clinic-management-tdd-ee9f27f356d8.herokuapp.com/api/websocket"
  ); //http://localhost:8080/websocket
  const stompClient = Stomp.over(socket);

  // Configure the client
  stompClient.debug = (str: string) => {
    console.log("STOMP: " + str);
  };

  return stompClient;
};
