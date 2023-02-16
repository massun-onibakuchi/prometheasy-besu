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
  level: 'debug',
  timestamp: true,
})
