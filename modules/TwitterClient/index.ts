import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import sqlExecute from '../SQLInterface';

import { load } from 'cheerio';

puppeteer.use(StealthPlugin());

export default class TwitterClient {
    private browser_: Browser;
    private page_: Page;

    private ready_ = false;

    public async waitForInit() {
        this.browser_ = await puppeteer.launch({
            args: [
                '--disable-web-security',
                '--disable-features=IsolateOrigins',
                '--disable-site-isolation-trials'
            ]
        });
        this.page_ = await this.browser_.newPage();
        await this.page_.setJavaScriptEnabled(true);
        this.page_.setExtraHTTPHeaders({
            'accept':
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' 
            });
        // await this.page_.setUserAgent(this.userAgent_.random().toString());
        this.ready_ = true;
    }

    private async fetch(url: string) {
        if (!this.ready_) {
            await this.waitForInit();
        }
        await this.page_.goto(url, { waitUntil: 'networkidle2' });
        return await this.page_.evaluate(() => document.getElementById('wid')
                                                .querySelector('iframe')
                                                .contentWindow.document
                                                .querySelector('body').innerHTML);
    }

    public async checkForNewUpdates(socMedUUID: string) {
        try {
            const sqlRes = await sqlExecute('SELECT page_id AS id, last_update AS lastUpdate FROM social_media WHERE UUID = ?', [socMedUUID]);
            const pageId = sqlRes[0].id;
            const lastUpdate = new Date(sqlRes[0].lastUpdate);
            const html = await this.fetch(`https://capstone4.cs.kent.edu/twitter-consortium?twitter=${pageId}`);
            let $ = load(html);
            let tweets = [];
            for (const child of $($('section[aria-label="Timeline"]').children()[0]).children()) {
                const time = $($(child).find('article > div > div > div:nth-child(2) > div:nth-child(2)').find('time')).attr('datetime');
                const tweet = $($(child).find('article > div > div > div:nth-child(2) > div:nth-child(2)').children()[1]).text();
                if (tweet.length > 0 && time.length > 0)
                    tweets.push({
                        tweet,
                        time: new Date(time)
                    });
            }

            tweets = tweets.reverse();
            
            let result = [];
            let latestUpdate = lastUpdate;
            for (const tweet of tweets) {
                if (tweet.time.getTime() > lastUpdate.getTime() || Number.isNaN(lastUpdate.getTime())) {
                    result.push(tweet.tweet);
                    if (tweet.time.getTime() > latestUpdate.getTime() || Number.isNaN(latestUpdate.getTime())) {
                        latestUpdate = tweet.time;
                    }
                }
            }

            try {
                await sqlExecute('UPDATE social_media SET last_update = ? WHERE UUID = ?', [latestUpdate.getTime(), socMedUUID]);
            }
            catch (err) {
                console.log(latestUpdate);
                console.error(err);
                process.exit(1);
            }
            return result;
        }
        catch (err) {
            console.error(err);
            return undefined;
        }
    }

    public async kill() {
        await this.browser_.close();
    }
}