import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  citizenID: string;
  email: string;
  gender: string;
  address: string;
  DoB: string;
  role: string;
  status: string;
}

interface UserManageState {
  users: User[];
}

const initialState: UserManageState = {
  users: [],
};

const userManageSlice = createSlice({
  name: "userManage",
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<User>) {
      state.users.push(action.payload);
    },
    setUserManage(state, action: PayloadAction<User>) {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser(state, action: PayloadAction<number>) {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
  },
});

export const { addUser, setUserManage, removeUser } = userManageSlice.actions;
export default userManageSlice.reducer;
