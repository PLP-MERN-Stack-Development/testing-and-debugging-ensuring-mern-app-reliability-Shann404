import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    loading: false,
    modal: {
      isOpen: false,
      type: null,
      data: null,
    },
    notification: {
      isOpen: false,
      message: '',
      type: 'info', // 'info', 'success', 'warning', 'error'
    },
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
    showNotification: (state, action) => {
      state.notification = {
        isOpen: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
    },
    hideNotification: (state) => {
      state.notification = {
        isOpen: false,
        message: '',
        type: 'info',
      };
    },
  },
});

export const { setLoading, openModal, closeModal, showNotification, hideNotification } = uiSlice.actions;
export default uiSlice.reducer;