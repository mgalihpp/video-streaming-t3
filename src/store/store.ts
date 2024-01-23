import { configureStore } from '@reduxjs/toolkit';
import editDialog from './editDialog';
import refetchUpload from './refetchUpload'

const store = configureStore({
  reducer: {
    dialog: editDialog,
    refetch: refetchUpload,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
