import { pino } from 'pino'

export const logger = pino({
  formatters: {
    level: (label) => ({
      level: label,
    }),
  },
  transport: {
    target: 'pino-pretty',
    colorize: true,
    translateTime: true,
  },
  level: process.env.LOG_LEVEL || 'info',
  timestamp: true,
})
