import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  name?: string;
  gender?: string;
  DoB?: string | null;
  citizenId?: string;
  phoneNumber?: string;
  address?: string;
  email?: string;
  password?: string;
  image?: string | null;
}

const initialState: ProfileState = {
  name: "",
  gender: "",
  DoB: null,
  citizenId: "",
  phoneNumber: "",
  address: "",
  email: "",
  password: "",
  image: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<ProfileState>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setProfile } = profileSlice.actions;
export default profileSlice.reducer;
