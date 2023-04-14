import { Request, Response, NextFunction, Express } from 'express';
import crypto from 'crypto';

import { TrailManager } from '../modules/TrailManager';

import sqlExecute from '../modules/SQLInterface';

export default (app: Express) => {
    // VERY BASIC authorization using a simple key
    app.use('/rest/*', (req: Request, res: Response, next: NextFunction) => {
        const apiKeys = process.env.API_AUTH_KEYS.split(' ||| ');
        const token = req.body?.token || req.headers['x-access-token'] || req.headers['X-Access-Token'];
        for (const apiKey of apiKeys) {
            if (token && crypto.timingSafeEqual(
                    Buffer.from(token, 'utf8'),
                    Buffer.from(apiKey, 'utf8')
                ))
                return next();
        }
        res.status(401).json({ error: 'Unauthorized' });
    });

    app.post('/rest/api/validate-token', (req: Request, res: Response) => {
        res.status(200).json({ valid: true });
    });

    // Social Media Accounts API endpoints
    const trailManager = TrailManager.getInstance();
    const fetchTrails = async (account: any) => {
        const uuids = await sqlExecute('SELECT trail_UUID as UUID FROM soc_med_trail_assoc WHERE social_UUID = ?', [account.UUID]);
        let trailUUIDs: string[] = [];
        for (const { UUID } of uuids)
            trailUUIDs.push(UUID);

        const trailFetchArray: Promise<any>[] = trailUUIDs.map(uuid => {
            return new Promise(async (resolve, reject) => {
                try {
                    const trailRes = await trailManager.retrieveTrail(uuid, true);
                    resolve(trailRes);
                }
                catch (err) {
                    reject(err);
                }
            });
        });

        const trails = await Promise.all(trailFetchArray);
        return trails;
    };

    app.get('/rest/api/social-media/accounts', async (req: Request, res: Response) => {
        try {
            if (req.query?.id || req.body?.id) {
                const id = req.query?.id || req.body?.id;
                const accounts = await sqlExecute('SELECT * FROM social_media WHERE UUID = ?', [id]);
                if (accounts.length === 1) {
                    let account = accounts[0];
                    account.trails = await fetchTrails(account);
                    res.status(200).json(account);
                }
                else
                    res.status(404).json({ error: 'Account not found' });
            }
            else {
                let accounts = await sqlExecute('SELECT * FROM social_media');
                for (let i = 0; i < accounts.length; i++)
                    accounts[i].trails = await fetchTrails(accounts[i]);
                res.status(200).json(accounts);
            }
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    const updateAccount = async (req: Request, res: Response) => {
        if (req.body?.id || req.query?.id) {
            const id = req.body?.id || req.query?.id;
            const sqlRes = await sqlExecute('SELECT * FROM social_media WHERE UUID = ?', [id]);
            if (sqlRes.length === 1) {
                let values = sqlRes[0];
                for (const key of Object.keys(values)) {
                    if (values[key] !== req.body[key] && key !== 'UUID')
                        values[key] = req.body[key];
                }

                try {
                    await sqlExecute('UPDATE social_media SET account_name = ?, platform = ?, page_id = ? WHERE UUID = ?', [values.account_name, values.platform, values.page_id, id]);
                    res.status(200).json({ success: true });
                }
                catch (err) {
                    res.status(500).json({ error: err.message });
                }
            }
            else
                res.status(404).json({ error: 'Account not found' });
        }
        else
            res.status(403).json({ error: 'You must specify an account to update' });
    };

    app.post('/rest/api/social-media/accounts/edit', updateAccount);
    app.patch('/rest/api/social-media/accounts', updateAccount);

    const addAccount = async (req: Request, res: Response) => {
        const requiredKeys = ['account_name', 'page_id'];
        for (const key of requiredKeys) {
            if (!req.body[key])
                return res.status(400).json({ error: `Missing required key: ${key}` });
        }

        try {
            const id = crypto.randomUUID();
            const defaultLastUpdate = (new Date()).getTime();
            await sqlExecute('INSERT INTO social_media (UUID, account_name, platform, page_id, last_update) VALUES (?,?,?,?,?)',
                             [id, req.body.account_name, req.body.platform || 'f5793968-d0d6-11ed-9c67-fecbfd91dfac', req.body.page_id, defaultLastUpdate]);
            res.status(200).json({ success: true, UUID: id });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    app.post('/rest/api/social-media/accounts/add', addAccount);
    app.put('/rest/api/social-media/accounts', addAccount);

    const deleteAccount = async (req: Request, res: Response) => {
        if (req.body?.id || req.query?.id) {
            const id = req.body?.id || req.query?.id;
            try {
                await sqlExecute('DELETE FROM social_media WHERE UUID = ?', [id]);
                res.status(200).json({ success: true });
            }
            catch (err) {
                res.status(500).json({ error: err.message });
            }
        }
        else
            res.status(400).json({ error: 'You must specify an account to remove' });
    };

    app.post('/rest/api/social-media/accounts/remove', deleteAccount);
    app.delete('/rest/api/social-media/accounts', deleteAccount);

    app.post('/rest/api/social-media/accounts/associate-trails', async (req: Request, res: Response) => {
        if (req.body?.id || req.query?.id) {
            const id = req.body?.id || req.query?.id;
            const trails = req.body?.trails;
            const sqlRes = await sqlExecute('SELECT * FROM social_media WHERE UUID = ?', [id]);
            if (trails && trails.length > 0) {
                if (sqlRes.length === 1) {
                    const account = sqlRes[0];
                    let promArray: Promise<any>[] = [];
                    for (const { UUID } of trails)
                        promArray.push(
                            sqlExecute('INSERT INTO soc_med_trail_assoc (social_UUID, trail_UUID) VALUES (?, ?)',
                                       [account.UUID, UUID])
                        );
                    try {
                        await Promise.all(promArray);
                        res.status(200).json({ success: true });
                    }
                    catch (err) {
                        res.status(500).json({ error: err.message });
                    }
                }
                else
                    res.status(404).json({ error: 'Account not found' });
            }
            else
                res.status(400).json({ error: 'You must specify trails to associate' });
        }
        else
            res.status(400).json({ error: 'You must specify an account to update' });
    });

    app.post('/rest/api/social-media/accounts/disassociate-trails', async (req: Request, res: Response) => {
        if (req.body?.id || req.query?.id) {
            const id = req.body?.id || req.query?.id;
            const trails = req.body?.trails;
            const sqlRes = await sqlExecute('SELECT * FROM social_media WHERE UUID = ?', [id]);
            if (trails && trails.length > 0) {
                if (sqlRes.length === 1) {
                    const account = sqlRes[0];
                    let promArray: Promise<any>[] = [];
                    for (const { UUID } of trails)
                        promArray.push(
                            sqlExecute('DELETE FROM soc_med_trail_assoc WHERE (social_UUID = ? AND trail_UUID = ?)',
                                       [account.UUID, UUID])
                        );
                    try {
                        await Promise.all(promArray);
                        res.status(200).json({ success: true });
                    }
                    catch (err) {
                        res.status(500).json({ error: err.message });
                    }
                }
                else
                    res.status(404).json({ error: 'Account not found' });
            }
            else
                res.status(400).json({ error: 'You must specify trails to associate' });
        }
        else
            res.status(400).json({ error: 'You must specify an account to update' });
    });

    // Trail API endpoints
    app.get('/rest/api/trails', async (req: Request, res: Response) => {
        let simple = req.body?.simple || req.query?.simple || false;
        if (typeof simple === 'string')
            simple = simple.toLowerCase().includes('t');
        if (req.body?.id || req.query?.id) {
            try {
                const trail = await trailManager.retrieveTrail(req.query?.id || req.body?.id, simple);
                res.status(200).json(trail);
            }
            catch (err) {
                res.status(500).json({ error: err.message });
            }
        }
        else {
            try {
                const trails = await trailManager.retrieveAllTrails(simple);
                res.status(200).json(trails);
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ error: err });
            }
        }
    });

    const updateTrails = async (req: Request, res: Response) => {
        if (req.body?.id || req.query?.id) {
            const id = req.body?.id || req.query?.id;
            const sqlRes = await sqlExecute('SELECT * FROM trails WHERE UUID = ?', [id]);
            if (sqlRes.length === 1) {
                let values = sqlRes[0];
                for (const key of Object.keys(values)) {
                    if (values[key] !== req.body[key] && key !== 'UUID')
                        values[key] = req.body[key];
                }

                try {
                    await sqlExecute('UPDATE trails SET mtb_id = ?, name = ?, city = ?, state = ?, center_latitude = ?, center_longitude = ? WHERE UUID = ?',
                                    [values.mtb_id, values.name, values.city, values.state.UUID, values.center_latitude, values.center_longitude, id]);
                    res.status(200).json({ success: true });
                }
                catch (err) {
                    res.status(500).json({ error: err.message });
                }
            }
            else
                res.status(404).json({ error: 'Trail not found' });
        }
        else
            res.status(403).json({ error: 'You must specify a trail to update' });
    };

    app.post('/rest/api/trails/edit', updateTrails);
    app.patch('/rest/api/trails', updateTrails);

    const addTrail = async (req: Request, res: Response) => {
        const requiredKeys = ['mtb_id', 'name', 'city', 'state', 'center_latitude', 'center_longitude'];
        for (const key of requiredKeys) {
            if (!req.body[key])
                return res.status(400).json({ error: `Missing required key: ${key}` });
        }

        try {
            const id = crypto.randomUUID();
            await sqlExecute('INSERT INTO trails (UUID, mtb_id, name, city, state, center_latitude, center_longitude) VALUES (?,?,?,?,?,?,?)',
                             [id, req.body.mtb_id, req.body.name, req.body.city, req.body.state.UUID || req.body.state, req.body.center_latitude, req.body.center_longitude]);
            res.status(200).json({ success: true, UUID: id });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    app.post('/rest/api/trails/add', addTrail);
    app.put('/rest/api/trails', addTrail);

    const deleteTrail = async (req: Request, res: Response) => {
        if (req.body?.id || req.query?.id) {
            const id = req.body?.id || req.query?.id;
            try {
                await sqlExecute('DELETE FROM trails WHERE UUID = ?', [id]);
                res.status(200).json({ success: true });
            }
            catch (err) {
                res.status(500).json({ error: err.message });
            }
        }
        else
            res.status(400).json({ error: 'You must specify a trail to remove' });
    };

    app.post('/rest/api/trails/remove', deleteTrail);
    app.delete('/rest/api/trails', deleteTrail);

    app.get('/rest/api/trails/states', async (req: Request, res: Response) => {
        try {
            const states = await sqlExecute('SELECT * FROM states');
            res.status(200).json(states);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/rest/api/trails/status/count', async (req: Request, res: Response) => {
        try {
            const count = await sqlExecute('SELECT COUNT(*) as count FROM status');
            res.status(200).json(count[0].count);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return app;
};