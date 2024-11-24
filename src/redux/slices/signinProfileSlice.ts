import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SigninProfileState {
  fullName?: string;
  citizenId?: string;
  email?: string;
  password?: string;
  gender?: string;
  address?: string;
  birthDate?: string;
}

const initialState: SigninProfileState = {
  fullName: "",
  citizenId: "",
  email: "",
  password: "",
  gender: "",
  address: "",
  birthDate: "",
};

const signupProfileSlice = createSlice({
  name: "signupProfile",
  initialState,
  reducers: {
    setSigninProfile(state, action: PayloadAction<SigninProfileState>) {
      return { ...state, ...action.payload };
    },
    resetSignupProfile() {
      return initialState;
    },
  },
});

export const { setSigninProfile, resetSignupProfile } =
  signupProfileSlice.actions;
export default signupProfileSlice.reducer;
