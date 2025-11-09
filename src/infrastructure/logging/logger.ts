import winston from 'winston';

/**
 * Níveis de log customizados
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Cores para cada nível
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

/**
 * Formato para desenvolvimento
 */
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

/**
 * Formato para produção (JSON estruturado)
 */
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Logger principal da aplicação
 */
export const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

/**
 * Stream para uso com Morgan (HTTP logging)
 */
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
