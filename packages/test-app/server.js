import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3001;

const server = http.createServer((req, res) => {
  // Handle root path
  if (req.url === "/" || req.url === "/index.html") {
    const filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error reading index.html");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }

  // Handle SDK dist files
  if (req.url.startsWith("/dist/")) {
    const relativePath = req.url.slice(1); // Remove leading slash
    const filePath = path.join(__dirname, "..", "sdk", relativePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found: " + req.url);
        return;
      }

      let contentType = "application/octet-stream";
      if (filePath.endsWith(".js")) contentType = "application/javascript";
      if (filePath.endsWith(".map")) contentType = "application/json";
      if (filePath.endsWith(".d.ts")) contentType = "application/typescript";

      res.writeHead(200, {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      });
      res.end(data);
    });
    return;
  }

  // 404 for other paths
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║  🚀 Omni Analytics SDK - Web Test Server                 ║
║                                                          ║
║  Server running at: http://localhost:${PORT}                   ║
║                                                          ║
║  ✅ Open your browser and navigate to:                  ║
║     http://localhost:${PORT}                                  ║
║                                                          ║
║  Features:                                              ║
║  • Track page views                                     ║
║  • Track click events                                   ║
║  • Track custom events                                  ║
║  • Manage user sessions                                 ║
║  • View real-time event log                             ║
║                                                          ║
║  Press Ctrl+C to stop the server                        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Server shutting down...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
