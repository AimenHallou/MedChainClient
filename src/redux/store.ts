// store.ts
import { configureStore } from '@reduxjs/toolkit';
import blockchainReducer from './slices/blockchainSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
    reducer: {
        blockchain: blockchainReducer,
        auth: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore certain paths from the serialization check
                ignoredPaths: ['blockchain.web3'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
