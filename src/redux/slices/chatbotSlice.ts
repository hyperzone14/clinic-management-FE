// src/redux/slices/chatbotSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../utils/axios-config';
import { CompatClient } from '@stomp/stompjs';
import { createStompClient } from '../../utils/websocket-config';
import { RootState } from '../store';

// Types remain the same but let's ensure Message type is strict
export interface Message {
  sender: string;
  content?: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
  
}

interface ChatRoom {
  id: number;
  roomName: string;
  userIds: number[]; 
}

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface ChatState {
  messages: Message[];
  isConnected: boolean;
  roomId: number | null;
  loading: boolean;
}

// Keep STOMP client in module scope
let stompClientInstance: CompatClient | null = null;

const initialState: ChatState = {
  messages: [],
  isConnected: false,
  roomId: null,
  loading: false
};

export const createAndJoinRoom = createAsyncThunk<
  { roomId: number },
  number,
  { state: RootState }
>(
  'chat/createAndJoinRoom',
  async (userId: number, { dispatch }) => {
    try {
      // Create the chat room first without checking participants
      const response = await apiService.post<ApiResponse<ChatRoom>>('/chat_room', {
        roomName: `X_Room`, // Matching your API request format
        userIds: [userId]   // Matching your API request format
      });

      // Validate room creation response
      if (!response?.result?.id) {
        console.error('Room creation failed:', response);
        throw new Error('Failed to create chat room');
      }

      const roomId = response.result.id;
      
      // Initialize WebSocket connection
      await dispatch(initializeWebSocket({ userId, roomId }));
      
      return { roomId };
    } catch (error) {
      console.error('Error in createAndJoinRoom:', error);
      throw error;
    }
  }
);



// Modified message handling in initializeWebSocket
export const initializeWebSocket = createAsyncThunk<
  void,
  { userId: number; roomId: number },
  { state: RootState }
>(
  'chat/initializeWebSocket',
  async ({ userId, roomId }, { dispatch }) => {
    try {
      if (stompClientInstance?.connected) {
        stompClientInstance.disconnect();
      }

      stompClientInstance = createStompClient();

      await new Promise<void>((resolve, reject) => {
        stompClientInstance?.connect(
          {},
          () => {
            console.log('WebSocket connected successfully');
            dispatch(setConnected(true));
            dispatch(setRoomId(roomId));

            // Modified subscription handler with better error handling
            stompClientInstance?.subscribe(`/topic/room/${roomId}`, (message) => {
              try {
                if (!message.body) {
                  console.warn('Received empty message body');
                  return;
                }

                const parsedMessage = JSON.parse(message.body);
                
                // Validate message structure
                if (typeof parsedMessage === 'object' && 
                    parsedMessage !== null && 
                    'type' in parsedMessage && 
                    'sender' in parsedMessage) {
                  dispatch(addMessage(parsedMessage as Message));
                } else {
                  console.warn('Invalid message format received:', parsedMessage);
                }
              } catch (error) {
                console.error('Error handling message:', error, 'Message body:', message.body);
              }
            });

            // Send JOIN message
            const joinMessage: Message = {
              sender: userId.toString(),
              type: 'JOIN'
            };

            stompClientInstance?.send(
              `/app/chat.register/${roomId}`,
              {},
              JSON.stringify(joinMessage)
            );

            dispatch(fetchChatHistory(roomId));
            resolve();
          },
          (error: any) => {
            console.error('STOMP connection error:', error);
            dispatch(setConnected(false));
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Error in initializeWebSocket:', error);
      throw error;
    }
  }
);

export const fetchChatHistory = createAsyncThunk<
  Message[],
  number,
  { state: RootState }
>(
  'chat/fetchHistory',
  async (roomId: number) => {
    try {
      const response = await apiService.get<ApiResponse<Message[]>>(
        `/chat_room/history/${roomId}`
      );
      
      // Clean up @bot prefix from message history
      const cleanedMessages = response.result.map(message => ({
        ...message,
        content: message.content?.replace(/^@bot\s+/g, '') || ''
      }));
      
      return cleanedMessages;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }
);

// Modified sendMessage with better error handling
export const sendMessage = createAsyncThunk<
  void,
  { content: string; sender: string },
  { state: RootState }
>(
  'chat/sendMessage',
  async (messageData, { getState }) => {
    const state = getState();
    const { roomId } = state.chat;

    if (!stompClientInstance?.connected) {
      throw new Error('WebSocket not connected');
    }

    if (!roomId) {
      throw new Error('No active room');
    }

    // Add @bot to the message content
    const message: Message = {
      type: 'CHAT',
      sender: messageData.sender,
      content: `@bot ${messageData.content}`
    };

    try {
      stompClientInstance.send(
        `/app/chat.send/${roomId}`,
        {},
        JSON.stringify(message)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
);

// Rest of the slice remains the same
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setRoomId: (state, action: PayloadAction<number>) => {
      state.roomId = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Ensure messages is initialized
      if (!Array.isArray(state.messages)) {
        state.messages = [];
      }

      // Basic validation of the incoming message
      const message = action.payload;
      if (!message || !message.type || !message.sender) {
        console.warn('Invalid message format:', message);
        return;
      }

      // More reliable duplicate check
      const isDuplicate = state.messages.some(existingMsg => 
        existingMsg &&
        existingMsg.type === message.type &&
        existingMsg.sender === message.sender &&
        existingMsg.content === message.content &&
        (message.type === 'CHAT' ? existingMsg.content === message.content : true)
      );
      
      if (!isDuplicate) {
        state.messages.push(message);
      }
    },
    clearChat: (state) => {
      state.messages = [];
      state.isConnected = false;
      state.roomId = null;
      if (stompClientInstance?.connected) {
        stompClientInstance.disconnect();
        stompClientInstance = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAndJoinRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAndJoinRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.roomId = action.payload.roomId;
      })
      .addCase(createAndJoinRoom.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        // Ensure the received payload is an array
        const messages = Array.isArray(action.payload) ? action.payload : [];
        state.messages = messages.filter(msg => msg && msg.type && msg.sender);
      });
  }
});

export const {
  setConnected,
  setRoomId,
  addMessage,
  clearChat
} = chatSlice.actions;

export const selectChat = (state: RootState) => state.chat;

export default chatSlice.reducer;