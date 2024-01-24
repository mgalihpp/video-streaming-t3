import { configureStore } from "@reduxjs/toolkit";
import editDialog from "./editDialog";
import refetchUpload from "./refetchUpload";
import themeSlice from "./theme";

// interface ThemeState {
//   selectedTheme: string;
// }

// const storedTheme = localStorage.getItem("theme");
// const defaultTheme = storedTheme ?? "light";

// const initialState: ThemeState = {
//   selectedTheme: defaultTheme,
// };

const store = configureStore({
  reducer: {
    dialog: editDialog,
    refetch: refetchUpload,
    theme: themeSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
