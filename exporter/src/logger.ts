import { pino } from 'pino'

export const logger = pino({
  formatters: {
    level: (label) => ({
      level: label,
    }),
  },
  transports: {
    target: 'pino/file',
    options: {
      destination: 'logs/out.log',
      mkdir: true,
    },
  },
  level: 'debug',
  timestamp: true,
})
