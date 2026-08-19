import { createApp } from "./app.js";
import { reset } from "./store.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

reset([
  "Read the Cloud Agent environment docs",
  "Run the task board end to end",
]);

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`Task board listening on http://${HOST}:${PORT}`);
});
