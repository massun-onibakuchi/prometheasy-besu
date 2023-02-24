import { pino } from 'pino'

export function createLogger(level: string = 'debug') {
  return pino({
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
    level,
    timestamp: true,
  })
}
