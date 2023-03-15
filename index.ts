import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Source map support for proper error reporting
import sms from 'source-map-support';
sms.install();

// Logging support
import winston from 'winston';
import exprWinston from 'express-winston';

import TrailManager from './modules/TrailManager/lib/TrailManager';
import logger from './modules/logger';

const PORT = process.env.PORT || 3000;
const app = express();

// Logging all requests to the console
app.use(exprWinston.logger({
    transports: [
        new winston.transports.Console({
            silent: process.env.NODE_ENV?.trim() === 'test' || process.env.NODE_ENV?.trim() === 'prod'
        })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    meta: false,
    msg: 'HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}'
}));

// Logging all requests to the log file
app.use(exprWinston.logger({
    transports: [
        new winston.transports.File({
            filename: 'combined.log',
            maxFiles: 1,
            maxsize: 10000000
        })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    meta: true,
    expressFormat: true
}));

// Logging all errors to the error log file
app.use(exprWinston.errorLogger({
    transports: [
        new winston.transports.File({
            filename: 'errors.log',
            maxFiles: 1,
            maxsize: 10000000
        })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    meta: true
}));

app.get('/', async (_: Request, res: Response) => {
    let man = TrailManager.getInstance();

    const startTime = Date.now();
    await man.retrieveWeatherHistory('f83932bd-c276-11ed-9652-ed7fb304f9d7');
    const endTime1 = Date.now();
    console.log(`Weather history run in ${(endTime1 - startTime)/1000} seconds`);

    const startTime1 = Date.now();
    await man.retrieveStatusHistory('f83932bd-c276-11ed-9652-ed7fb304f9d7');
    const endTime2 = Date.now();
    console.log(`Status history run in ${(endTime2 - startTime1)/1000} seconds`);

    const startTime2 = Date.now();
    await man.retrieveTrail('f83932bd-c276-11ed-9652-ed7fb304f9d7');
    const endTime = Date.now();
    console.log(`Retrieve trail run in ${(endTime - startTime2)/1000} seconds`);

    console.log(`All 3 functions run in ${(endTime - startTime)/1000} seconds`);
    res.status(200).sendFile(path.join(__dirname, './public/html/index.html'));
});

app.listen(PORT, () => {
    logger.log({
        level: 'info',
        message: `Server listening on port ${PORT}`
    });
});