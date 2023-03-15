// Imports
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({
            filename: 'errors.log',
            level: 'error',
            silent: process.env.NODE_ENV?.trim() === 'test',
            maxsize: 10000000,
            maxFiles: 1
        }),
        new winston.transports.File({
            filename: 'combined.log',
            silent: process.env.NODE_ENV?.trim() === 'test',
            maxsize: 10000000,
            maxFiles: 1
        }),
    ],
});

if (process.env.NODE_ENV !== 'prod') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
        silent: process.env.NODE_ENV?.trim() === 'test'
    }));
}

export default logger;