// src/redux/slices/chatbotSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../utils/axios-config';
import { CompatClient } from '@stomp/stompjs';
import { createStompClient } from '../../utils/websocket-config';
import { RootState } from '../store';

// Types
export interface Message {
  sender: string;
  content: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
}

interface ChatRoom {
  id: number;
  roomName: string;
  participantsId: number[];
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
  stompClient: CompatClient | null;
}

const initialState: ChatState = {
  messages: [],
  isConnected: false,
  roomId: null,
  loading: false,
  stompClient: null
};

// Thunks
export const createAndJoinRoom = createAsyncThunk<
  { roomId: number },
  number,
  { state: RootState }
>(
  'chat/createAndJoinRoom',
  async (userId: number, { dispatch }) => {
    try {
      const response = await apiService.post<ApiResponse<ChatRoom>>('/chat_room', {
        roomName: `support_room_${userId}`,
        userIds: [userId]
      });

      const roomId = response.result.id;
      await dispatch(initializeWebSocket({ userId, roomId }));
      
      return { roomId };
    } catch (error) {
      console.error('Error creating chat room:', error);
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
      const response = await apiService.get<ApiResponse<Message[]>>(`/chat_room/history/${roomId}`);
      return response.result;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }
);

export const initializeWebSocket = createAsyncThunk<
  CompatClient,
  { userId: number; roomId: number },
  { state: RootState }
>(
  'chat/initializeWebSocket',
  async ({ userId, roomId }, { dispatch }) => {
    try {
      const stompClient = createStompClient();

      return new Promise<CompatClient>((resolve, reject) => {
        stompClient.connect(
          {},
          () => {
            dispatch(setStompClient(stompClient));
            dispatch(setConnected(true));
            dispatch(setRoomId(roomId));

            stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
              try {
                const parsedMessage = JSON.parse(message.body);
                dispatch(addMessage(parsedMessage));
              } catch (error) {
                console.error('Error parsing message:', error);
              }
            });

            stompClient.send(
              `/app/chat.register/${roomId}`,
              {},
              JSON.stringify({
                sender: `User_${userId}`,
                type: 'JOIN',
                content: ''
              })
            );

            dispatch(fetchChatHistory(roomId));
            resolve(stompClient);
          },
          (error: any) => {
            console.error('STOMP error:', error);
            dispatch(setConnected(false));
            dispatch(setStompClient(null));
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      throw error;
    }
  }
);

export const sendMessage = createAsyncThunk<
  void,
  Message,
  { state: RootState }
>(
  'chat/sendMessage',
  async (message: Message, { getState }) => {
    const state = getState();
    const { stompClient, roomId } = state.Chat;

    if (stompClient && roomId) {
      stompClient.send(
        `/app/chat.send/${roomId}`,
        {},
        JSON.stringify(message)
      );
    }
  }
);

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
      state.messages.push(action.payload);
    },
    setStompClient: (state, action: PayloadAction<CompatClient | null>) => {
      state.stompClient = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.isConnected = false;
      if (state.stompClient) {
        state.stompClient.disconnect();
      }
      state.stompClient = null;
      state.roomId = null;
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
        state.messages = action.payload;
      })
      .addCase(initializeWebSocket.fulfilled, (state, action) => {
        state.stompClient = action.payload;
      })
      .addCase(initializeWebSocket.rejected, (state) => {
        state.stompClient = null;
        state.isConnected = false;
      });
  }
});

export const {
  setConnected,
  setRoomId,
  addMessage,
  setStompClient,
  clearChat
} = chatSlice.actions;

export const selectChat = (state: RootState) => state.Chat;

export default chatSlice.reducer;