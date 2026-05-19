import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface SiteState {
  loading: boolean;
  routerPrev: string;
  openLogout: boolean;
  isMobile: boolean;
  ip: string;
  formLogin: any;
  language: string;
  darkMode: boolean;
}

const initialState: SiteState = {
  loading: true,
  routerPrev: "/",
  openLogout: false,
  isMobile: false,
  ip: "",
  formLogin: null,
  language: "",
  darkMode: false,
};

export const siteSlice = createSlice({
  name: "site",
  initialState,
  reducers: {
    updateRouterPrev: (state, action: PayloadAction<string>) => {
      state.routerPrev = action?.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action?.payload;
    },
    setOpenLogout: (state, action: PayloadAction<boolean>) => {
      state.openLogout = action.payload;
    },
    setFormLogin: (state, action: PayloadAction<any>) => {
      state.formLogin = action?.payload;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    toogleDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
  },
});

export const {
  updateRouterPrev,
  setLoading,
  setOpenLogout,
  setFormLogin,
  setIsMobile,
  setLanguage,
  toogleDarkMode,
} = siteSlice.actions;
// Action creators are generated for each case reducer function
export default siteSlice.reducer;
