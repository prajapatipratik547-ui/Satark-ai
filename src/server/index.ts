import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 8080);

const server = createApp().listen(port, () => {
  console.log(`Satark listening on port ${String(port)}`);
});

// Cloud Run sends SIGTERM before stopping an instance; let in-flight requests finish.
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
