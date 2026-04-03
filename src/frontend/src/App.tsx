import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminPage from "./pages/AdminPage";
import BuilderPage from "./pages/BuilderPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MarketplacePage from "./pages/MarketplacePage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import RegisterPage from "./pages/RegisterPage";

function LoginTracker() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (identity && actor && !hasRecorded.current) {
      hasRecorded.current = true;
      (actor as any).recordLogin().catch(() => {
        // silently ignore errors
      });
    }
    if (!identity) {
      hasRecorded.current = false;
    }
  }, [identity, actor]);

  return null;
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <LoginTracker />
      <Outlet />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const builderNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builder/new",
  component: BuilderPage,
});

const builderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builder/$siteId",
  component: BuilderPage,
});

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/marketplace",
  component: MarketplacePage,
});

const purchaseSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/purchase-success",
  component: PurchaseSuccessPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  builderNewRoute,
  builderRoute,
  marketplaceRoute,
  purchaseSuccessRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
