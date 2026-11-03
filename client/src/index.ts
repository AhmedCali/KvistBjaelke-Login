import { serve } from "bun";
import index from "./index.html";

// Hvor .NET-API'et kører under udvikling (dotnet run)
const API_URL = process.env.API_URL ?? "http://localhost:5188";

const server = serve({
  routes: {
    // api-kald videre til backend med bun dev
    "/api/*": (req) => {
      const url = new URL(req.url);
      return fetch(API_URL + url.pathname + url.search, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
    },
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);