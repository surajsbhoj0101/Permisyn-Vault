import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppProviders from "./components/AppProviders.tsx";
import AuthProvider from "./contexts/AuthContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Overview from "./pages/developer_pages/Overview.tsx";
import ManageApps from "./pages/developer_pages/ManageApps.tsx";
import DeveloperAccessLogs from "./pages/developer_pages/AccessLogs.tsx";
import AppSchemaManager from "./pages/developer_pages/AppSchemaManager.tsx";
import AppConsentRequests from "./pages/developer_pages/AppConsentRequests.tsx";
import UserOverview from "./pages/user_pages/Overview.tsx";
import UserSessions from "./pages/user_pages/Sessions.tsx";
import UserAccessLogs from "./pages/user_pages/AccessLogs.tsx";
import UserSettings from "./pages/user_pages/Settings.tsx";
import AddRecordPage from "./pages/user_pages/AddRecordPage.tsx";

import "./index.css";
import App from "./App.tsx";
import Onboarding from "./pages/Onboarding.tsx";

const isDevelopment = import.meta.env.DEV;
// Temporary route used only while building and validating the local SDK.
const SDKPlayground = isDevelopment
  ? lazy(() => import("./pages/developer_pages/SDKPlayground.tsx"))
  : null;

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
      {
        path: "manage-apps/:appId/schema",
        element: <AppSchemaManager />,
      },
      {
        path: "manage-apps/:appId/requests",
        element: <AppConsentRequests />,
      },
      {
        path: "access-logs",
        element: <DeveloperAccessLogs />,
      },
      ...(isDevelopment && SDKPlayground
        ? [
            {
              path: "sdk-playground",
              element: (
                <Suspense fallback={null}>
                  <SDKPlayground />
                </Suspense>
              ),
            },
          ]
        : []),
    ],
  },
  {
    path: "/user",
    children: [
      {
        path: "overview",
        element: <UserOverview />,
      },
      {
        path: "add-record",
        element: <AddRecordPage />,
      },
      {
        path: "sessions",
        element: <UserSessions />, 
      },
      {
        path: "access-logs",
        element: <UserAccessLogs />,
      },
      {
        path: "settings",
        element: <UserSettings />,
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
