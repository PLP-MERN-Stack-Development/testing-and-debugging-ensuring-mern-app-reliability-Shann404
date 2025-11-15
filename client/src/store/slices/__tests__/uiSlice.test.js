// src/store/slices/__tests__/uiSlice.test.js
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, { showNotification, hideNotification, setLoading, openModal, closeModal } from '../uiSlice';

describe('UI Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiReducer
      }
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().ui;
      expect(state).toEqual({
        loading: false,
        notification: {
          isOpen: false,
          message: '',
          type: 'info'
        },
        modal: {
          isOpen: false,
          type: null,
          data: null
        }
      });
    });
  });

  describe('notification actions', () => {
    it('should show notification with custom type and message', () => {
      const notificationData = {
        type: 'success',
        message: 'Operation successful'
      };
      
      store.dispatch(showNotification(notificationData));
      
      const state = store.getState().ui;
      expect(state.notification).toEqual({
        isOpen: true,
        type: 'success',
        message: 'Operation successful'
      });
    });

    it('should hide notification', () => {
      // First show a notification
      store.dispatch(showNotification({ type: 'info', message: 'Test' }));
      
      expect(store.getState().ui.notification.isOpen).toBe(true);
      
      store.dispatch(hideNotification());
      
      const state = store.getState().ui;
      expect(state.notification.isOpen).toBe(false);
    });

    it('should show notification with default type if not provided', () => {
      store.dispatch(showNotification({ message: 'Test message' }));
      
      const state = store.getState().ui;
      expect(state.notification.type).toBe('info');
      expect(state.notification.message).toBe('Test message');
      expect(state.notification.isOpen).toBe(true);
    });
  });

  describe('loading actions', () => {
    it('should set loading state to true', () => {
      store.dispatch(setLoading(true));
      expect(store.getState().ui.loading).toBe(true);
    });

    it('should set loading state to false', () => {
      store.dispatch(setLoading(false));
      expect(store.getState().ui.loading).toBe(false);
    });
  });

  describe('modal actions', () => {
    it('should open modal with type and data', () => {
      const modalData = {
        type: 'createPost',
        data: { title: 'Test' }
      };
      
      store.dispatch(openModal(modalData));
      
      const state = store.getState().ui;
      expect(state.modal).toEqual({
        isOpen: true,
        type: 'createPost',
        data: { title: 'Test' }
      });
    });

    it('should close modal', () => {
      // First open a modal
      store.dispatch(openModal({ type: 'editPost', data: {} }));
      
      expect(store.getState().ui.modal.isOpen).toBe(true);
      
      store.dispatch(closeModal());
      
      const state = store.getState().ui;
      expect(state.modal.isOpen).toBe(false);
      expect(state.modal.type).toBeNull();
      expect(state.modal.data).toBeNull();
    });
  });
});