import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface User {
  username: string;
  fullname: string;
}

export interface UserState {
  balance: number;
  user: User | null;
}

const initialState: UserState = {
  balance: 0,
  user: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action?.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action?.payload;
    },
  },
});

export const { setBalance, setUser } = userSlice.actions;
export default userSlice.reducer;
