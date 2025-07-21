import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./styles.css";
import config from "./config.json";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Trung's Spotify Status" },
    { 
      name: "description", 
      content: "A website which displays my Spotify status." 
    },
    {
      property: "og:title",
      content: "Vũ Thành Trung"
    },
    {
      property: "og:description",
      content: "A website which displays my Spotify status."
    },
    {
      property: "og:image",
      content: "/assets/banner.png"
    },
    {
      name: "twitter:title",
      content: "Vũ Thành Trung"
    },
    {
      name: "twitter:card",
      content: "summary_large_image"
    },
    {
      name: "twitter:description",
      content: "A website which displays my Spotify status."
    },
    {
      name: "twitter:image",
      content: "/assets/banner.png"
    }
  ];
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="container" className="container">
          <div className="user-info" id="user-info">
            <img
              src={config.avatar ? config.avatar : "/assets/avatar.png"}
              alt="User Avatar"
              className="user-avatar"
              width={300}
              height={300}
            />
            <div className="user-name">{config.name}</div>
          </div>

          {children}

          <div className="credit" id="credit">
            Made by <a href="https://discord.gg/TR8k3MtjNZ">Vũ Thành Trung</a> |{" "}
            <a href="https://github.com/vuthanhtrung2010/spotify-status">
              Github
            </a>
          </div>

          <div className="space-y-0">
            <p className="mt-8 text-base leading-8 text-center text-gray-400">
              &copy; 2024 Trung - All Rights Reserved.
            </p>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
