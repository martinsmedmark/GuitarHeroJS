// server.js
// Simple Express server for serving the Guitar Hero game

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 8080;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

// Serve static files from the project root
app.use(
  express.static(".", {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Serve images with proper MIME type
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Handle all other routes by serving index.html (for SPA behavior)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🎸 Guitar Hero JS server running at http://localhost:${PORT}`);
  console.log("Press Ctrl+C to stop the server");
});
