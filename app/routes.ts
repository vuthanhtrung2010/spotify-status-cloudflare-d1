import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("/api/current-track", "routes/api.current-track.tsx"),
  route("/callback", "routes/callback.tsx"),
  route("/login", "routes/login.tsx"),
] satisfies RouteConfig;
