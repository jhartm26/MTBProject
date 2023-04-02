import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
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

declare global {
    interface Error {
        status?: number | undefined;
    }
}

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

// // For parsing request bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

import { load } from 'cheerio';
import MTBClient from './modules/TrailManager/lib/MTBClient';
import TextParser from './modules/TrailManager/lib/TextParser';
import TextPreprocessor from './modules/TrailManager/lib/TextPreprocessor';
import TwitterClient from './modules/TwitterClient';
import TrailExecutive from './modules/TrailManager';

const t = new TextParser();
const te = new TrailExecutive();
te.waitForInit().then(async () => {
    const tc = new TwitterClient();
    await tc.waitForInit();
    const tweets = await tc.checkForNewUpdates('07f9cc6a-d0d7-11ed-9c67-fecbfd91dfac');
    for (const tweet of tweets) {
        await te.updateOnTweet(tweet, '07f9cc6a-d0d7-11ed-9c67-fecbfd91dfac');
    }
});

const AUTHORIZED_IPS = ['76.190.42.180', '24.239.82.238'];

app.get('/', async (req: Request, res: Response) => {
    let ip = req.header('x-forwarded-for');
    if (!ip)
        ip = req.socket.remoteAddress;

    res.status(200).sendFile(path.join(__dirname, './public/html/index.html'));
});

app.get('/twitter-consortium', async (req: Request, res: Response) => {
    let ip = req.header('x-forwarded-for');
    if (!ip)
        ip = req.socket.remoteAddress;

    let $ = load(fs.readFileSync(path.join(__dirname, './public/html/twitters.html')));

    const result = $.html().replaceAll('{{twitter}}', req.query.twitter as string);

    res.status(200).send(result);
});

app.post('/test/api/parse', async (req: Request, res: Response) => {
    let ip = req.header('x-forwarded-for');
    if (!ip)
        ip = req.socket.remoteAddress;

    if (AUTHORIZED_IPS.includes(ip))
        res.status(200).send(await te.parseTweetToStatus(req.body?.tweet || req.query?.tweet));
    else
        res.status(403).send('You do not have access to this');
});

app.use((_1: Request, _2: Response, next: NextFunction) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handling
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
    const urlsToPrank = ['/robots.txt', '/owa/auth/logon.aspx?url=https%3a%2f%2f1%2fecp%2f',
                         '/vodarticle/d03CCS.html', '/remote/fgt_lang', '/version',
                         '/.well-known/security.txt', '/sitemap.xml', '/owa/auth/x.js',
                         '/owa/auth/logon.aspx', '/ecp/Current/exporttool/microsoft.exchange.ediscovery.exporttool.application'];
    if (urlsToPrank.includes(req.url.toLowerCase()))
        res.status(200).send('Who are you that keeps visiting these strange endpoints?');
    else if (err.status === 404)
        res.status(404).send({ message: 'Page not found' });
    else
        res.status(500).send({ message: 'Unhandled exception has occurred' });
});

app.listen(PORT, () => {
    logger.log({
        level: 'info',
        message: `Server listening on port ${PORT}`
    });
});