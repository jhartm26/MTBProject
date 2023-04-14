import TextPreprocessor from './lib/TextPreprocessor';
import MTBClient from './lib/MTBClient';
import TextParser from './lib/TextParser';
import TrailManager from './lib/TrailManager';

export {
    TrailManager,
    TextPreprocessor,
    MTBClient,
    TextParser
};

export default class TrailExecutive {
    private textPreprocessor_ = new TextPreprocessor();
    private mtbClient_ = new MTBClient();
    private textParser_ = new TextParser();
    private trailManager_ = TrailManager.getInstance();

    public async waitForInit() {
        await this.mtbClient_.waitForInit();
        await this.mtbClient_.authorize();
        await this.textParser_.waitForInit();
    }

    public async updateOnTweet(tweet: string, accountUUID: string) {
        const sep = await this.textPreprocessor_.assignTrails(tweet, accountUUID);
        for (const tweet of Object.keys(sep)) {
            const status = await this.textParser_.parseTweetToStatus(tweet);
            if (status) {
                for (const { name, uuid } of sep[tweet]) {
                    await this.trailManager_.updateTrailStatus(uuid, status);
                    return await this.mtbClient_.updateTrail(await this.trailManager_.retrieveTrail(uuid));
                }
            }
        }
    }

    public async parseTweetToStatus(tweet: string) {
        return await this.textParser_.parseTweetToStatus(tweet);
    }

    public async assignTrails(tweet: string, accountUUID: string) {
        return await this.textPreprocessor_.assignTrails(tweet, accountUUID);
    }

    public async kill() {
        await this.mtbClient_.kill();
        this.textParser_.killPredictor();
    }
}