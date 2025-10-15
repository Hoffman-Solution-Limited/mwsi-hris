import { leaveApi } from "@/features";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

export const store = configureStore({
    reducer: {
      [leaveApi.reducerPath]: leaveApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        leaveApi.middleware
      ),
  });

setupListeners(store.dispatch);


