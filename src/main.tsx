import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { UsersProvider } from "./contexts/UsersContext.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UsersProvider>
      <App />
    </UsersProvider>
  </React.StrictMode>
);
