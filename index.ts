import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

// Source map support for proper error reporting
import sms from 'source-map-support';
sms.install();

// Logging support
import winston from 'winston';
import exprWinston from 'express-winston';

import { load } from 'cheerio';

import logger from './modules/logger';
import TwitterClient from './modules/TwitterClient';
import TrailExecutive from './modules/TrailManager';
import sqlExecute from './modules/SQLInterface';
import resPr from './modules/PrankResArr';

import initRestAPI from './rest';

declare global {
    interface Error {
        status?: number | undefined;
    }
}

const PORT = process.env.PORT || 3000;
let app = express();
let serverStateFlag = 0;

// Logging all requests to the console
app.use(exprWinston.logger({
    transports: [
        new winston.transports.Console({
            silent: process.env.NODE_ENV?.trim() === 'test' || process.env.NODE_ENV?.trim() === 'prod'
        })
    ],
    format: winston.format.combine(
        winston.format.timestamp(),
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
        winston.format.timestamp(),
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
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.json()
    ),
    meta: true
}));

// // For parsing request bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

const allowCrossDomain = (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, POST, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, X-Requested-With, x-access-token');

    if (req.method === 'OPTIONS') {
        res.status(200).send('OK');
    }
    else {
        next();
    }
};

app.use(allowCrossDomain);

let twitterClient = new TwitterClient();
let trailExec = new TrailExecutive();

// Calls kill on tc and te, logs errors, and recreates them
const rebuild = async (err: Error) => {
    serverStateFlag = 0;
    logger.error('The following error occurred:');
    logger.error(err);
    logger.error('Killing twitter client and trail executive...');
    try {
        await twitterClient.kill();
        logger.error('Twitter client successfully killed...');
    }
    catch (killErr) {
        logger.error(killErr);
    }

    try {
        await trailExec.kill();
        logger.error('Trail executive successfully killed...');
    }
    catch (killErr) {
        logger.error(killErr);
    }

    logger.error('Restarting twitter client and trail executive...');
    twitterClient = new TwitterClient();
    trailExec = new TrailExecutive();

    await Promise.all([twitterClient.waitForInit(), trailExec.waitForInit()]);
    logger.error('Successfully recreated Twitter and Trail executive.');
    serverStateFlag = 1;
};

const AUTHORIZED_IPS = ['131.123.35.146', // Capstone Server IP
                        '76.190.42.180', '24.239.82.238',
                        '10.22.33.123'];

app.get('/', async (_: Request, res: Response) => {
    res.status(200).sendFile(path.join(__dirname, './public/admin/index.html'));
});

app.get('/favicon*', (_: Request, res: Response) => {
    res.status(200).sendFile(path.join(__dirname, './public/admin/favicon.ico'));
});

app.get('/assets/:resourceID(*)', (req: Request, res: Response) => {
    const filename = req.params.resourceID;
    const filepath = path.join(__dirname, `./public/admin/assets/${filename}`);
    if (fs.existsSync(filepath))
        res.sendFile(filepath);
    else
        res.status(404).send(`${filename} not found`);
});

app.get('/easter-eggs/waffle', (_: Request, res: Response) => {
    res.status(200).sendFile(path.join(__dirname, './public/html/waffle.html'));
});

app.get('/twitter-consortium', async (req: Request, res: Response) => {
    let ip = req.header('x-forwarded-for');
    if (!ip)
        ip = req.socket.remoteAddress;

    if (AUTHORIZED_IPS.includes(ip)) {
        let $ = load(fs.readFileSync(path.join(__dirname, './public/html/twitters.html')));
        const result = $.html().replaceAll('{{twitter}}', req.query.twitter as string);
        res.status(200).send(result);
    }
    else
        res.status(403).send('You do not have access to this\r\n');
});

app.post('/private/api/check-socials', async (req: Request, res: Response) => {
    let ip = req.header('x-forwarded-for');
    if (!ip)
        ip = req.socket.remoteAddress;

    if (AUTHORIZED_IPS.includes(ip)) {
        const socialMediaUUIDs = await sqlExecute('SELECT UUID FROM social_media');
        let num_updated = 0;
        for (const { UUID } of socialMediaUUIDs) {
            try {
                const tweets = await twitterClient.checkForNewUpdates(UUID);
                for (const tweet of tweets)
                    if(await trailExec.updateOnTweet(tweet, UUID))
                        num_updated++;
            }
            catch (err) {
                await rebuild(err);
            }
        }
        res.status(200).json({ numberUpdated: num_updated });
    }
    else
        res.status(403).send('You do not have access to this\r\n');
});


app.post('/test/api/parse', async (req: Request, res: Response) => {
    let ip = req.header('x-forwarded-for');
    if (!ip)
        ip = req.socket.remoteAddress;

    if (AUTHORIZED_IPS.includes(ip))
        res.status(200).send(await trailExec.parseTweetToStatus(req.body?.tweet || req.query?.tweet));
    else
        res.status(403).send('You do not have access to this\r\n');
});
// MUST init API routes before app.use on 404 error handler
app = initRestAPI(app);

app.post('/rest/api/check-socials', async (_: Request, res: Response) => {
    const socialMediaUUIDs = await sqlExecute('SELECT UUID FROM social_media');
    let num_updated = 0;
    for (const { UUID } of socialMediaUUIDs) {
        try {
            const tweets = await twitterClient.checkForNewUpdates(UUID);
            for (const tweet of tweets)
                if(await trailExec.updateOnTweet(tweet, UUID))
                    num_updated++;
        }
        catch (err) {
            await rebuild(err);
        }
    }
    res.status(200).json({ numberUpdated: num_updated });
});

app.get('/public/api/twitter-consortium', async (req: Request, res: Response) => {
    let $ = load(fs.readFileSync(path.join(__dirname, './public/html/twitters.html')));
    const result = $.html().replaceAll('{{twitter}}', req.query.twitter as string);
    res.status(200).send(result);
});


app.get('/rest/api/heartbeat', (req: Request, res: Response) => {
    res.status(200).json({ state: serverStateFlag });
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
    if (urlsToPrank.includes(req.url.toLowerCase()) || req.url.toLowerCase().includes('php') ||
        req.url.toLowerCase().includes('db') || req.url.toLowerCase().includes('sql'))
        res.status(200).send(`${resPr[Math.floor(Math.random() * resPr.length)]}\r\n`);
    else if (err.status === 404)
        res.status(404).send({ message: 'Page not found' });
    else {
        if (err)
            logger.error(err);
        res.status(500).send({ message: 'Unhandled exception has occurred' });
    }
});

const killServer = async (exitCode: number=0) => {
    serverStateFlag = 0;
    let errorFlag = 0;
    try {
        await trailExec.kill();
    }
    catch (err) {
        logger.error(err);
        errorFlag++;
    }
    try {
        await twitterClient.kill();
    }
    catch (err) {
        logger.error(err);
        errorFlag++;
    }

    if (errorFlag === 0) {
        logger.info('Gracefully stopped. Ending process...');
        process.exit(exitCode);
    }
    else {
        logger.error(`Stopped with ${errorFlag} errors`);
        process.exit(1);
    }
        
};

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception, exiting with error:');
    logger.error(error);
    killServer(1);
});
process.on('SIGINT', killServer);
process.on('SIGTERM', killServer);

logger.info('Starting up, wait for initialization of Bot and Twitter Client...');
const promArr = [
    trailExec.waitForInit().then(async () => {
        logger.info('Bot initialization complete!');
    }),
    twitterClient.waitForInit().then(() => {
        logger.info('Twitter client is ready!');
    })
];

Promise.all(promArr).then(() => {
    app.listen(PORT, () => {
        logger.info(`Init complete! Server listening on port ${PORT}.`);
        serverStateFlag = 1;
    });
}).catch(err => {
    logger.error(err);
    process.exit(1);
});