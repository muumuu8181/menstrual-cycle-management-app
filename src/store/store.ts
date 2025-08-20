import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import userSlice from './slices/userSlice';
import cyclesSlice from './slices/cyclesSlice';
import symptomsSlice from './slices/symptomsSlice';
import predictionsSlice from './slices/predictionsSlice';
import uiSlice from './slices/uiSlice';

const persistConfig = {
  key: 'femcare-pro',
  storage,
  whitelist: ['user', 'ui'], // Only persist user settings and UI state
};

const rootReducer = combineReducers({
  user: userSlice.reducer,
  cycles: cyclesSlice.reducer,
  symptoms: symptomsSlice.reducer,
  predictions: predictionsSlice.reducer,
  ui: uiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;