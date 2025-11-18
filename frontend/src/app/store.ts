import { documentTypeApi, employeeApi, employeeDocumentApi, employeeFileApi, fileRequestApi, leaveApi } from "@/features";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

export const store = configureStore({
    reducer: {
      [leaveApi.reducerPath]: leaveApi.reducer,
      [employeeFileApi.reducerPath]: employeeFileApi.reducer,
      [documentTypeApi.reducerPath]: documentTypeApi.reducer,
      [fileRequestApi.reducerPath]: fileRequestApi.reducer,
      [employeeApi.reducerPath]: employeeApi.reducer,
      [employeeDocumentApi.reducerPath]: employeeDocumentApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        leaveApi.middleware,
        employeeFileApi.middleware,
        documentTypeApi.middleware,
        fileRequestApi.middleware,
        employeeApi.middleware,
        employeeDocumentApi.middleware
      ),
  });

setupListeners(store.dispatch);
