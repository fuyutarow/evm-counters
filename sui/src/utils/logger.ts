import { createConsola } from "consola/browser";

const isProd = process.env.NODE_ENV === "production";

// Minimal logger configuration
export const logger = createConsola({
  level: isProd ? 1 : 3, // error/warn in prod, debug in dev
});

// Main logger for all usage

export default logger;
