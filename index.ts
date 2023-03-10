#!/usr/bin/env node

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

const PORT = process.env.PORT || 3000;
const app = express();

app.get('/', (req: Request, res: Response) => {
    res.status(200).sendFile(path.join(__dirname, './public/html/index.html'));
});

app.listen(PORT, () => {
    console.info(`Listening on port ${PORT}`);
});