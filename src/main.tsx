import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import { UsersProvider } from "./contexts/UsersContext.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <UsersProvider>
        <App />
      </UsersProvider>
    </Provider>
  </React.StrictMode>
);
