import pino from 'pino';

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      level: 'info',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      },
    },
    {
      target: 'pino/file',
      level: 'error',
      options: { destination: './logs/error.log' },
    },
    {
      target: 'pino/file',
      level: 'warn',
      options: { destination: './logs/warn.log' },
    },
  ],
});

export const logger = pino(
  {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  },
  transport,
);
