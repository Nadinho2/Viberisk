import http from "http";
import app from "./app";
import { env } from "./config/env";
import { connectDb } from "./config/db";

const start = async () => {
  await connectDb();

  const server = http.createServer(app);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`VibeRisk API listening on port ${env.port}`);
  });
};

void start();

