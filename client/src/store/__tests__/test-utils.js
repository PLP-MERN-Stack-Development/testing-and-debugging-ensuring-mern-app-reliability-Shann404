import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import postsReducer from '../slices/postsSlice';
import uiReducer from '../slices/uiSlice';

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        posts: postsReducer,
        ui: uiReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      posts: postsReducer,
      ui: uiReducer,
    },
    preloadedState,
  });
};