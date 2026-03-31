import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import AppProviders from "./components/AppProviders.tsx";
import AuthProvider from "./contexts/AuthContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "./App.tsx";
import Onboarding from "./pages/Onboarding.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <App />
      </>
    ),
  },
  {
    path: "/onboarding",
    element: (
      <>
        <Navbar />
        <Onboarding />
      </>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AppProviders>
    </QueryClientProvider>
  </StrictMode>,
);
