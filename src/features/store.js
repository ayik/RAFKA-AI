import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import promptReducer from './promptSlice';

const persistConfig = {
  key: 'gemini-chat',
  version: 1,
  storage,
  whitelist: ['prompt'],
};

const persistedReducer = persistReducer(persistConfig, promptReducer);

const crashReporter = store => next => action => {
  try {
    return next(action);
  } catch (err) {
    console.error('Redux Error:', err, 'Current State:', store.getState());
    throw err;
  }
};

export const store = configureStore({
  reducer: {
    prompt: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(crashReporter),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
