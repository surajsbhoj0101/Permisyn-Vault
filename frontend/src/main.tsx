import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppProviders from "./components/AppProviders.tsx";
import AuthProvider from "./contexts/AuthContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Overview from "./pages/developer_pages/Overview.tsx";
import ManageApps from "./pages/developer_pages/ManageApps.tsx";

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

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/onboarding",
        element: <Onboarding />,
      },
    ],
  },
  {
    path: "/developer",
    children: [
      {
        path: "overview",
        element: <Overview />,
      },
      {
        path: "manage-apps",
        element: <ManageApps />,
      },
    ],
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
