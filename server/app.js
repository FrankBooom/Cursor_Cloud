import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.get("/api/tasks", (_req, res) => {
    res.json(listTasks());
  });

  app.post("/api/tasks", (req, res, next) => {
    try {
      const task = createTask(req.body?.title);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/tasks/:id", (req, res, next) => {
    try {
      const task = updateTask(Number(req.params.id), req.body ?? {});
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/tasks/:id", (req, res, next) => {
    try {
      const removed = deleteTask(Number(req.params.id));
      res.json(removed);
    } catch (error) {
      next(error);
    }
  });

  app.use(express.static(publicDir));

  // eslint-disable-next-line no-unused-vars
  app.use((error, _req, res, _next) => {
    const status = error.status ?? 500;
    res.status(status).json({ error: error.message ?? "Internal Server Error" });
  });

  return app;
}
