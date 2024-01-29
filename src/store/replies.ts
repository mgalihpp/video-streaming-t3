import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type RootState } from "./store";

interface RepliesState {
  openReplies: Record<string, boolean>;
  expandReplies: Record<string, boolean>;
}

const initialState: RepliesState = {
  openReplies: {},
  expandReplies: {},
};

const repliesSlice = createSlice({
  name: "replies",
  initialState,
  reducers: {
    openReplies: (state, action: PayloadAction<string>) => {
      state.openReplies[action.payload] = true;
    },
    closeReplies: (state, action: PayloadAction<string>) => {
      state.openReplies[action.payload] = false;
    },
    expandReplies: (state, action: PayloadAction<string>) => {
      state.expandReplies[action.payload] = true;
    },
    unExpandReplies: (state, action: PayloadAction<string>) => {
      state.expandReplies[action.payload] = false;
    },
  },
});

export const { openReplies, closeReplies, expandReplies, unExpandReplies } =
  repliesSlice.actions;
export const selectRepliesState = (state: RootState) =>
  state.replies.openReplies;
export const selectExpandRepliesState = (state: RootState) =>
  state.replies.expandReplies;

export default repliesSlice.reducer;
