import pino from 'pino';

const level = process.env.LOG_LEVEL || "info";
const isDev = process.env.NODE_ENV === "development";
const logger = pino({
  level,
  transport: isDev ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname"
    }
  } : void 0,
  base: { pid: void 0, hostname: void 0 },
  formatters: {
    level: (label) => ({ level: label })
  }
});

export { logger as l };
