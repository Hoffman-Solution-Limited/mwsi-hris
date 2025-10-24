import { documentTypeApi, employeeFileApi, leaveApi } from "@/features";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

export const store = configureStore({
    reducer: {
      [leaveApi.reducerPath]: leaveApi.reducer,
      [employeeFileApi.reducerPath]: employeeFileApi.reducer,
      [documentTypeApi.reducerPath]: documentTypeApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        leaveApi.middleware,
        employeeFileApi.middleware,
        documentTypeApi.middleware
      ),
  });

setupListeners(store.dispatch);


