import { pino } from 'pino'
import { LOG_LEVEL } from './config'

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
  level: LOG_LEVEL,
  timestamp: true,
})
