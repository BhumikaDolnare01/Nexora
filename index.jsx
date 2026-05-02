import { useState } from "react";
import './theme.css';

const files = {
  "server.js": `import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", environment: process.env.NODE_ENV });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running in \${process.env.NODE_ENV} mode on port \${PORT}\`);
});

export default app;`,

  "config/db.js": `import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(\`✅ MongoDB connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`❌ MongoDB connection error: \${error.message}\`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected");
});

export default connectDB;`,

  ".env.example": `# Application
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/myapp

# Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000`,

  "package.json": `{
  "name": "express-mongo-boilerplate",
  "version": "1.0.0",
  "description": "Production-ready Express + MongoDB boilerplate",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint ."
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongoose": "^8.4.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}`,

  "middleware/errorHandler.js": `/**
 * Centralized error handling middleware.
 * Attach to the bottom of your Express app.
 */
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;

  if (process.env.NODE_ENV === "development") {
    console.error("[ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;`,

  "utils/AppError.js": `/**
 * Custom operational error class.
 * Use this to throw predictable, user-facing errors.
 *
 * @example
 * throw new AppError("User not found", 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;`,

  ".gitignore": `# Dependencies
node_modules/

# Environment
.env
.env.local

# Logs
logs/
*.log
npm-debug.log*

# Build
dist/
build/

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/`,
};

const tree = [
  { type: "dir", name: "backend/", depth: 0 },
  { type: "dir", name: "config/", depth: 1 },
  { type: "file", name: "db.js", depth: 2, key: "config/db.js", tag: "DB" },
  { type: "dir", name: "controllers/", depth: 1, empty: true },
  { type: "dir", name: "middleware/", depth: 1 },
  { type: "file", name: "errorHandler.js", depth: 2, key: "middleware/errorHandler.js", tag: "MW" },
  { type: "dir", name: "models/", depth: 1, empty: true },
  { type: "dir", name: "routes/", depth: 1, empty: true },
  { type: "dir", name: "utils/", depth: 1 },
  { type: "file", name: "AppError.js", depth: 2, key: "utils/AppError.js", tag: "UTIL" },
  { type: "file", name: ".env.example", depth: 1, key: ".env.example", tag: "ENV" },
  { type: "file", name: ".gitignore", depth: 1, key: ".gitignore", tag: "GIT" },
  { type: "file", name: "package.json", depth: 1, key: "package.json", tag: "PKG" },
  { type: "file", name: "server.js", depth: 1, key: "server.js", tag: "MAIN" },
];

const tagColors = {
  DB: "#c9a84c",
  MW: "#7c9e8a",
  UTIL: "#8a7ca0",
  ENV: "#9e7c7c",
  GIT: "#7c8a9e",
  PKG: "#9e8a7c",
  MAIN: "#c9a84c",
};

export default function App() {
  const [active, setActive] = useState("server.js");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(files[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
      background: "#0a0a0a",
      color: "#f5f0e8",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        background: "#111111",
        borderBottom: "1px solid #2a2520",
        padding: "16px 28px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg, #c9a84c44 0%, #c9a84c22 100%)",
          border: "1px solid #c9a84c55",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15,
        }}>⚡</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "#f5f0e8" }}>
            EXPRESS + MONGODB BOILERPLATE
          </div>
          <div style={{ fontSize: 11, color: "#8a8578", marginTop: 1 }}>
            production-ready · ESM · dotenv · mongoose
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {["node ≥18", "express ^4", "mongoose ^8"].map(t => (
            <span key={t} style={{
              fontSize: 10, padding: "3px 8px", borderRadius: 4,
              background: "#1a1a1a", border: "1px solid #2a2520",
              color: "#8a8578", letterSpacing: "0.05em",
            }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: 230,
          background: "#111111",
          borderRight: "1px solid #2a2520",
          padding: "16px 0",
          overflowY: "auto",
          flexShrink: 0,
        }}>
          <div style={{ padding: "0 16px 10px", fontSize: 10, color: "#8a8578", letterSpacing: "0.1em" }}>
            FILE EXPLORER
          </div>
          {tree.map((item, i) => {
            const isFile = item.type === "file";
            const isActive = isFile && item.key === active;
            return (
              <div
                key={i}
                onClick={() => isFile && setActive(item.key)}
                style={{
                  padding: `5px 16px 5px ${16 + item.depth * 14}px`,
                  cursor: isFile ? "pointer" : "default",
                  background: isActive ? "rgba(201,168,76,0.10)" : "transparent",
                  borderLeft: isActive ? "2px solid #c9a84c" : "2px solid transparent",
                  display: "flex", alignItems: "center", gap: 7,
                  transition: "background 0.15s",
                  color: item.empty ? "#8a8578" : isActive ? "#f5f0e8" : item.type === "dir" ? "#d4c9a8" : "#c8c0b0",
                  fontSize: 12,
                }}
              >
                <span style={{ flexShrink: 0, opacity: 0.7 }}>
                  {item.type === "dir" ? "📁" : "📄"}
                </span>
                <span style={{ flex: 1 }}>{item.name}</span>
                {item.tag && (
                  <span style={{
                    fontSize: 9, padding: "1px 5px", borderRadius: 3,
                    background: tagColors[item.tag] + "22",
                    border: `1px solid ${tagColors[item.tag]}44`,
                    color: tagColors[item.tag],
                    letterSpacing: "0.06em",
                  }}>{item.tag}</span>
                )}
                {item.empty && (
                  <span style={{ fontSize: 9, color: "#8a8578" }}>empty</span>
                )}
              </div>
            );
          })}

          {/* Install hint */}
          <div style={{
            margin: "20px 12px 0",
            padding: "10px 12px",
            background: "#1a1a1a",
            border: "1px solid #2a2520",
            borderRadius: 6,
          }}>
            <div style={{ fontSize: 9, color: "#8a8578", marginBottom: 6, letterSpacing: "0.08em" }}>QUICK START</div>
            {["npm install", "cp .env.example .env", "npm run dev"].map((cmd, i) => (
              <div key={i} style={{ fontSize: 10, color: "#c9a84c", marginBottom: 2 }}>
                <span style={{ color: "#8a8578" }}>$ </span>{cmd}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{
            background: "#111111",
            borderBottom: "1px solid #2a2520",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}>
            <div style={{
              padding: "10px 16px",
              fontSize: 12,
              background: "#0a0a0a",
              borderRight: "1px solid #2a2520",
              borderTop: "1px solid #c9a84c",
              color: "#f5f0e8",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>📄</span>
              {active}
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={copy}
              style={{
                padding: "5px 14px",
                fontSize: 11,
                background: copied ? "rgba(201,168,76,0.15)" : "#1a1a1a",
                border: `1px solid ${copied ? "#c9a84c88" : "#2a2520"}`,
                color: copied ? "#c9a84c" : "#8a8578",
                borderRadius: 5,
                cursor: "pointer",
                letterSpacing: "0.05em",
                transition: "all 0.2s",
              }}
            >
              {copied ? "✓ COPIED" : "COPY"}
            </button>
          </div>

          {/* Code */}
          <div style={{
            flex: 1,
            overflow: "auto",
            padding: "20px 24px",
            background: "#0a0a0a",
          }}>
            <pre style={{
              margin: 0,
              fontSize: 12.5,
              lineHeight: 1.7,
              color: "#d4c9a8",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {files[active].split("\n").map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 16 }}>
                  <span style={{ color: "#2a2520", userSelect: "none", minWidth: 28, textAlign: "right", flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <span style={{
                    color: line.trim().startsWith("//") || line.trim().startsWith("*") || line.trim().startsWith("#")
                      ? "#8a8578"
                      : line.includes("import ") || line.includes("export ")
                      ? "#c9a84c"
                      : line.includes("process.env") || line.includes("console.")
                      ? "#9eb89e"
                      : "#d4c9a8",
                  }}>{line || " "}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: "#111111",
        borderTop: "1px solid #2a2520",
        padding: "8px 28px",
        display: "flex", alignItems: "center", gap: 20,
        fontSize: 10, color: "#8a8578",
      }}>
        <span>7 files generated</span>
        <span style={{ color: "#2a2520" }}>|</span>
        <span>ESM modules</span>
        <span style={{ color: "#2a2520" }}>|</span>
        <span>No feature routes</span>
        <span style={{ color: "#2a2520" }}>|</span>
        <span style={{ color: "#c9a84c99" }}>ready to extend →</span>
      </div>
    </div>
  );
}