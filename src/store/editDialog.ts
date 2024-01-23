import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type RootState } from "./store";

interface DialogState {
  openVideos: Record<string, boolean>; // Mapping from videoId to its dialog state
}

const initialState: DialogState = {
  openVideos: {},
};

const editDialogSlice = createSlice({
  name: "dialog",
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<string>) => {
      state.openVideos[action.payload] = true;
    },
    closeDialog: (state, action: PayloadAction<string>) => {
      state.openVideos[action.payload] = false;
    },
  },
});

export const { openDialog, closeDialog } = editDialogSlice.actions;
export const selectDialogState = (state: RootState) => state.dialog;

export default editDialogSlice.reducer;
