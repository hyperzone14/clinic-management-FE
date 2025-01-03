import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  fullName?: string;
  gender?: string;
  DoB?: string | null;
  citizenId?: string;
  phoneNumber?: string;
  address?: string;
  email?: string;
  password?: string;
  imageURL?: string | null;
  // imageFile?: File | null;
}

const initialState: ProfileState = {
  fullName: "",
  gender: "",
  DoB: null,
  citizenId: "",
  phoneNumber: "",
  address: "",
  email: "",
  password: "",
  imageURL: null,
  // imageFile: null,
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
