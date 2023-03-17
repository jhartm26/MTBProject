import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
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

import { load } from 'cheerio';
import MTBClient from './modules/TrailManager/lib/MTBClient';
import TextParser from './modules/TrailManager/lib/TextParser';

const t = new TextParser();
t.parseTweetToStatus('Update: 3/2/2023 - Trails remain CLOSED at this time.').then(l => {
    console.log(l);
});

app.get('/', async (_: Request, res: Response) => {
    // const t = new MTBClient();
    // await t.waitForInit();
    // await t.authorize();
    // let man = TrailManager.getInstance();
    // const trail = await man.retrieveTrail('f83932bd-c276-11ed-9652-ed7fb304f9d7');
    // console.log(trail);
    // console.log(await t.updateTrail(trail));
    res.status(200).sendFile(path.join(__dirname, './public/html/index.html'));
});

app.listen(PORT, () => {
    logger.log({
        level: 'info',
        message: `Server listening on port ${PORT}`
    });
});