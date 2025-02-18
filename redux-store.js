import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import newsReducer from './slices/newsSlice';

const store = configureStore({
  reducer: {
    game: gameReducer,
    auth: authReducer,
    chat: chatReducer,
    news: newsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['socket/connected', 'socket/disconnected'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.socket'],
        // Ignore these paths in the state
        ignoredPaths: ['game.socket'],
      },
    }),
});

export default store;
