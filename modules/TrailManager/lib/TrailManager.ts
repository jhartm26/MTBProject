import crypto from 'crypto';
import axios from 'axios';
import { Mutex } from 'async-mutex';

import sqlExecute, { sqlObject } from '../../SQLInterface';

const convert = async (toC: sqlObject): Promise<Status> => {
    return {
        UUID: toC.UUID,
        open: toC.open,
        danger: toC.danger,
        createdOn: toC.created_on,
        mtbStatus: (await sqlExecute('SELECT * FROM mtb_statuses WHERE UUID = ?', [toC.mtb_status]))[0]?.status,
        conditions: {
            dry: toC.dry,
            mostlyDry: toC.mostly_dry,
            muddy: toC.muddy,
            someMud: toC.some_mud,
            snowy: toC.snowy,
            icy: toC.icy,
            fallenTrees: toC.fallen_trees
        }
    };
};

/**
 * Singleton class TrailManager
 * 
 * TODO: Test asynchronous safety
 */
export default class TrailManager {
    private static instance_: TrailManager;
    private static mutex_ = new Mutex();

    private constructor() { }

    public static getInstance() {
        if (!TrailManager.instance_)
            TrailManager.instance_ = new TrailManager();

        return TrailManager.instance_;
    }

    private static async execute_(fn: Function): Promise<any> {
        await this.mutex_.waitForUnlock();
        await this.mutex_.acquire();

        let res: any = undefined;
        let error: Error = undefined;

        try {
            res = await fn();
        }
        catch (err) {
            error = err;
        }

        this.mutex_.release();

        if (error) throw error;

        return res;
    }

    private async getWeatherData(lat: number, lng: number): Promise<any> {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&appid=${process.env.OPEN_WEATHER_API_KEY}`;

        try {
            const t = (await axios.get(url)).data;
            return t;
        }
        catch (err) {
            throw err.response.data;
        }
    }

    public async updateTrailStatus(trailUUID: string, status: Status): Promise<void> {
        try {
            await TrailManager.execute_(async () => {
                const trails = await sqlExecute(`SELECT weather, status,
                                                 center_latitude AS centerLatitude, 
                                                 center_longitude AS centerLongitude 
                                                 FROM trails WHERE UUID = ?`, 
                                                [trailUUID]) as Trail[];
                let trail: Trail;
                if (trails.length === 1)
                    trail = trails[0];
                else
                    throw new Error(`Trail with UUID "${ trailUUID }" could not be found`);

                const lastWeatherUUID = trail.weather;
                const lastStatusUUID = trail.status;

                const weather = await this.getWeatherData(trail.centerLatitude, trail.centerLongitude);

                let precipitation = 'none';
                if (weather.rain)
                    precipitation = 'rain';
                else if (weather.snow)
                    precipitation = 'snow';

                const newWeather: Weather = {
                    UUID: crypto.randomUUID(),
                    lastReportedTemp: weather.main.temp,
                    precipitation: precipitation,
                    wind: `${weather.wind.deg}° @ ${weather.wind.speed} MPH`,
                    notes: weather.weather[0]?.main,
                    createdOn: new Date()
                };

                const newStatus = status;

                await sqlExecute(`INSERT INTO weather (UUID, last_reported_temperature, precipitation, wind, notes, created_on) 
                                  VALUES (?, ?, ?, ?, ?, ?)`,
                                 [newWeather.UUID, newWeather.lastReportedTemp, newWeather.precipitation,
                                  newWeather.wind, newWeather.notes, newWeather.createdOn]);
                await sqlExecute(`INSERT INTO status (UUID, open, danger, created_on, mtb_status, dry, mostly_dry, muddy,
                                  some_mud, snowy, icy, fallen_trees) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                 [newStatus.UUID, newStatus.open, newStatus.danger, newStatus.createdOn, newStatus.mtbStatus,
                                  newStatus.conditions.dry, newStatus.conditions.mostlyDry, newStatus.conditions.muddy,
                                  newStatus.conditions.someMud, newStatus.conditions.snowy, newStatus.conditions.icy,
                                  newStatus.conditions.fallenTrees]);

                await sqlExecute('UPDATE trails SET weather = ?, status = ?, last_update = ? WHERE UUID = ?',
                                 [newWeather.UUID, newStatus.UUID, new Date(), trailUUID]);

                if (lastWeatherUUID)
                    await sqlExecute(`INSERT INTO weather_archive (archived_on, trail_UUID, weather_UUID) VALUES 
                                      (?, ?, ?)`, [new Date(), trailUUID, lastWeatherUUID]);
                if (lastStatusUUID)
                    await sqlExecute(`INSERT INTO status_archive (archived_on, trail_UUID, status_UUID) VALUES 
                                      (?, ?, ?)`, [new Date(), trailUUID, lastStatusUUID]);
            });
        }
        catch (err) {
            throw err;
        }
    }

    public async retrieveWeatherHistory(trailUUID: string): Promise<Weather[]> {
        await TrailManager.mutex_.waitForUnlock();
        const currWeatherUUID = (await sqlExecute('SELECT weather FROM trails WHERE UUID = ?', [trailUUID]))[0]?.weather;
        const res = await sqlExecute('SELECT weather_UUID AS UUID FROM weather_archive WHERE trail_UUID = ?', [trailUUID]);

        let promArr: Promise<Weather>[] = [sqlExecute(`SELECT UUID, last_reported_temperature AS lastReportedTemp, 
                                                         precipitation, wind, notes, created_on AS createdOn
                                                         FROM weather WHERE UUID = ?`, [currWeatherUUID]).then(data => data[0] as Weather)];
        for (const obj of res) {
            promArr.push(sqlExecute(`SELECT UUID, last_reported_temperature AS lastReportedTemp, 
                                     precipitation, wind, notes, created_on AS createdOn
                                     FROM weather WHERE UUID = ? ORDER BY created_on DESC`, [obj.UUID])
                        .then(data => data[0] as Weather));
        }

        return await Promise.all(promArr);
    }

    public async retrieveStatusHistory(trailUUID: string): Promise<Status[]> {
        await TrailManager.mutex_.waitForUnlock();
        const currStatusUUID = (await sqlExecute('SELECT status FROM trails WHERE UUID = ?', [trailUUID]))[0]?.status;
        const res = await sqlExecute('SELECT status_UUID AS UUID FROM status_archive WHERE trail_UUID = ?', [trailUUID]);

        let promArr: Promise<Status>[] = [sqlExecute('SELECT * FROM status WHERE UUID = ?', [currStatusUUID]).then(async data => {
            return await convert(data[0]);
        })];

        for (const obj of res) {
            promArr.push(sqlExecute('SELECT * FROM status WHERE UUID = ?', [obj.UUID]).then(async data => {
                return await convert(data[0]);
            }));
        }

        return await Promise.all(promArr);
    }

    public async retrieveTrail(trailUUID: string, simple=true): Promise<Trail> {
        await TrailManager.mutex_.waitForUnlock();
        const res = (await sqlExecute('SELECT * FROM trails WHERE UUID = ?', [trailUUID]))[0];

        if (simple)
            return res;

        const status = (await sqlExecute('SELECT * FROM status WHERE UUID = ?', [res.status]))[0];
        const result: Trail = {
            UUID: res.UUID,
            mtbID: res.mtb_id,
            name: res.name,
            city: res.city,
            state: (await sqlExecute('SELECT * FROM states WHERE UUID = ?', [res.state]))[0] as State,
            centerLatitude: res.center_latitude,
            centerLongitude: res.center_longitude,
            lastUpdate: res.last_update,
            weather: (await sqlExecute(`SELECT UUID, last_reported_temperature AS lastReportedTemp, 
                                       precipitation, wind, notes, created_on AS createdOn
                                       FROM weather WHERE UUID = ?`, [res.weather]))[0] as Weather,
            status: status ? await convert(status) : null
        };

        return result;
    }

    public async retrieveAllTrails(simple=true): Promise<Trail[]> {
        await TrailManager.mutex_.waitForUnlock();
        const sqlRes = await sqlExecute('SELECT * FROM trails');

        const result: Trail[] = simple ? sqlRes : [];
        if (!simple) {
            for (const res of sqlRes) {
                const status = (await sqlExecute('SELECT * FROM status WHERE UUID = ?', [res.status]))[0];
                result.push({
                    UUID: res.UUID,
                    mtbID: res.mtb_id,
                    name: res.name,
                    city: res.city,
                    state: (await sqlExecute('SELECT * FROM states WHERE UUID = ?', [res.state]))[0] as State,
                    centerLatitude: res.center_latitude,
                    centerLongitude: res.center_longitude,
                    lastUpdate: res.last_update,
                    weather: (await sqlExecute(`SELECT UUID, last_reported_temperature AS lastReportedTemp, 
                                            precipitation, wind, notes, created_on AS createdOn
                                            FROM weather WHERE UUID = ?`, [res.weather]))[0] as Weather,
                    status: status ? await convert(status) : null
                });
            }
        }

        return result;
    }
}