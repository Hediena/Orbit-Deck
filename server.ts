import express from "express";
import { createServer as createViteServer } from "vite";
import { initDb } from "./server/init.js";
import apiRoutes from "./server/routes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB
  initDb();

  // API Routes
  app.use("/api", apiRoutes);
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Orbit Deck API", version: "1.0.0" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // En producción, servir estáticos desde dist/
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Orbit Deck Server running on http://localhost:${PORT}`);
  });
}

startServer();
