import sqlExecute from '../../SQLInterface';
import crypto from 'crypto';
import axios from 'axios';

import { Mutex } from 'async-mutex';

export default class TrailManager {
    private static instance_: TrailManager;
    private static mutex_ = new Mutex();

    private constructor() { }

    public static getInstance() {
        if (!TrailManager.instance_)
            TrailManager.instance_ = new TrailManager();

        return TrailManager.instance_;
    }

    private static async execute_(fn: Function) {
        await this.mutex_.waitForUnlock();
        await this.mutex_.acquire();

        let res: any = undefined;

        try {
            res = await fn();
        }
        catch (err) {
            this.mutex_.release();
            throw err;
        }

        this.mutex_.release();

        return res;
    }

    private async getWeatherData(lat: number, lng: number): Promise<any> {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&appid=${process.env.OPEN_WEATHER_API_KEY}`;

        try {
            const t = (await axios.get(url)).data;
            return t;
        }
        catch (err) {
            console.error(err.response.data);
            return undefined;
        }
    }

    public async updateTrailStatus(trailUUID: string, open: boolean,
                                   danger: string, status: MTBStatus,
                                   conditions: Conditions): Promise<void> {
        try {
            await TrailManager.execute_(async () => {
                const trails = await sqlExecute(`SELECT *, mtb_id AS mtbID, 
                                                 center_latitude AS centerLatitude, 
                                                 center_longitude AS centerLongitude, 
                                                 last_update AS lastUpdate FROM trails WHERE UUID = ?`, 
                                                [trailUUID]) as Trail[];
                let trail: Trail;
                if (trails.length === 1)
                    trail = trails[0];
                else
                    throw new Error(`Trail with UUID "${ trailUUID }" could not be found`);

                const lastWeatherUUID = trail.weather;
                const lastStatusUUID = trail.status;

                const weather = await this.getWeatherData(trail.centerLatitude, trail.centerLongitude);

                let precipitation: string;
                if (weather.rain)
                    precipitation = 'rain';
                else if (weather.snow)
                    precipitation = 'snow';

                const newWeather: Weather = {
                    UUID: crypto.randomUUID(),
                    lastReportedTemp: weather.main.temp,
                    precipitation,
                    wind: `${weather.wind.deg}° @ ${weather.wind.speed} MPH`,
                    notes: weather.weather[0]?.main,
                    createdOn: new Date()
                };

                const newStatus: Status = {
                    UUID: crypto.randomUUID(),
                    open,
                    danger,
                    createdOn: new Date(),
                    mtbStatus: status.UUID,
                    conditions
                };

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

                await sqlExecute(`INSERT INTO weather_archive (archived_on, trail_UUID, weather_UUID) VALUES 
                                  (?, ?, ?)`, [new Date(), trailUUID, lastWeatherUUID]);
                await sqlExecute(`INSERT INTO status_archive (archived_on, trail_UUID, status_UUID) VALUES 
                                  (?, ?, ?)`, [new Date(), trailUUID, lastStatusUUID]);
            });
        }
        catch (err) {
            throw err;
        }
    }

    public async retrieveWeatherHistory(trailUUID: string) {

    }
}