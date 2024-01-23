import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { type RootState } from "./store";

interface TriggerRefetch {
  isRefetch: boolean;
}

const initialState: TriggerRefetch = {
  isRefetch: false,
};

const TriggerRefetchSlice = createSlice({
  name: "refecth",
  initialState,
  reducers: {
    setTriggerRefetch: (state, action: PayloadAction<boolean>) => {
      state.isRefetch = action.payload;
    },
  },
});

export const { setTriggerRefetch } = TriggerRefetchSlice.actions;

export const selectTriggerRefetchState = (state: RootState) => state.refetch;
export default TriggerRefetchSlice.reducer;
