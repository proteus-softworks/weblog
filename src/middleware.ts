import type { MiddlewareHandler } from "astro";

import pino from "pino";
const logger = pino();

export const onRequest: MiddlewareHandler = async ({ request }, next) => {
  logger.info({ method: request.method, url: request.url }, "request");
  return next();
};
