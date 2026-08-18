import "../styles/app.css";

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
  <>
    <Outlet />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      // your meta tags and site config
    ],
    // other head config
  }),
  component: RootLayout,
});
