import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';
const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level,
  transport: isDev ? {
    target: 'pino-pretty',
    options: { 
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname'
    }
  } : undefined,
  base: { pid: undefined, hostname: undefined },
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export default logger;
