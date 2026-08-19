import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { createApp } from "../server/app.js";
import { reset } from "../server/store.js";

function freshApp() {
  reset();
  return createApp();
}

test("health check reports ok", async () => {
  const app = freshApp();
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "ok");
});

test("starts with an empty task list", async () => {
  const app = freshApp();
  const res = await request(app).get("/api/tasks");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, []);
});

test("creates a task", async () => {
  const app = freshApp();
  const res = await request(app).post("/api/tasks").send({ title: "Write docs" });
  assert.equal(res.status, 201);
  assert.equal(res.body.title, "Write docs");
  assert.equal(res.body.done, false);
  assert.equal(typeof res.body.id, "number");
});

test("rejects an empty task title", async () => {
  const app = freshApp();
  const res = await request(app).post("/api/tasks").send({ title: "   " });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /required/i);
});

test("toggles a task done state", async () => {
  const app = freshApp();
  const created = await request(app).post("/api/tasks").send({ title: "Ship it" });
  const res = await request(app)
    .patch(`/api/tasks/${created.body.id}`)
    .send({ done: true });
  assert.equal(res.status, 200);
  assert.equal(res.body.done, true);
});

test("deletes a task", async () => {
  const app = freshApp();
  const created = await request(app).post("/api/tasks").send({ title: "Temporary" });
  const del = await request(app).delete(`/api/tasks/${created.body.id}`);
  assert.equal(del.status, 200);

  const list = await request(app).get("/api/tasks");
  assert.deepEqual(list.body, []);
});

test("returns 404 when updating a missing task", async () => {
  const app = freshApp();
  const res = await request(app).patch("/api/tasks/999").send({ done: true });
  assert.equal(res.status, 404);
});
