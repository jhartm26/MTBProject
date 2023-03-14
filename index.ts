import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import TrailManager from './modules/TrailManager/lib/TrailManager';

const PORT = process.env.PORT || 3000;
const app = express();

app.get('/', async (_: Request, res: Response) => {
    let man = TrailManager.getInstance();
    man.updateTrailStatus('f83932bd-c276-11ed-9652-ed7fb304f9d7', true, 'AHH',
                          { 
                            UUID: '810aada8-b0f1-4c3f-84bf-80318bf7f9d3',
                            status: 'Bad / Closed'
                          },
                          {
                            dry: false,
                            mostlyDry: false,
                            muddy: false,
                            someMud: false,
                            snowy: true,
                            icy: true,
                            fallenTrees: false
                          });
    res.status(200).sendFile(path.join(__dirname, './public/html/index.html'));
});

app.listen(PORT, () => {
    console.info(`Listening on port ${PORT}`);
});