import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import { Mutex } from 'async-mutex';

puppeteer.use(StealthPlugin());

const SelectorDict = {
    Login: {
        email: '#login-modal > div > div > div.modal-body > div > div.login-signup-block > form:nth-child(7) > div:nth-child(1) > input',
        password: '#login-modal > div > div > div.modal-body > div > div.login-signup-block > form:nth-child(7) > div:nth-child(2) > input',
        submit: 'form[action="https://www.mtbproject.com/auth/login/email"] > button'
    },
    UpdatePage: {
        Dials: {
            green: '#conditions-modal > div.row.gray-block > div > div.dials > div.dial.green > input',
            yellow: '#conditions-modal > div.row.gray-block > div > div.dials > div.dial.yellow > input',
            red: '#conditions-modal > div.row.gray-block > div > div.dials > div.dial.red > input'
        },
        Conditions: {
            dry: '#conditions-modal > div:nth-child(4) > div > div.form-group.tighter.buttons > a.btn.btn-sm.btn-transparent.suggestion.suggestion-modal.suggestion-0',
            mostlyDry: '#conditions-modal > div:nth-child(4) > div > div.form-group.tighter.buttons > a.btn.btn-sm.btn-transparent.suggestion.suggestion-modal.suggestion-3' ,
            muddy: '#conditions-modal > div:nth-child(4) > div > div.form-group.tighter.buttons > a.btn.btn-sm.btn-transparent.suggestion.suggestion-modal.suggestion-1',
            someMud: '#conditions-modal > div:nth-child(4) > div > div.form-group.tighter.buttons > a.btn.btn-sm.btn-transparent.suggestion.suggestion-modal.suggestion-4',
            snowy: '#conditions-modal > div:nth-child(4) > div > div.form-group.tighter.buttons > a.btn.btn-sm.btn-transparent.suggestion.suggestion-modal.suggestion-2',
            icy: '#conditions-modal > div:nth-child(4) > div > div.form-group.tighter.buttons > a.btn.btn-sm.btn-transparent.suggestion.suggestion-modal.suggestion-5',
            fallenTrees: '#conditions-modal > div:nth-child(4) > div > div.form-group.tighter.buttons > a.btn.btn-sm.btn-transparent.suggestion.suggestion-modal.suggestion-6',
        },
        submit: '#submit-modal'
    }
};

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default class MTBClient {
    private username_: string = process.env.MTB_USER;
    private password_: string = process.env.MTB_PASS;
    private mutex_ = new Mutex();
    private userAgent_: UserAgent;

    private browser_: Browser;
    private page_: Page;

    private ready_ = false;
    private authorized_ = false;

    constructor() { 
        this.userAgent_ = new UserAgent();
    }

    public async waitForInit() {
        this.browser_ = await puppeteer.launch();
        this.page_ = await this.browser_.newPage();
        await this.page_.setUserAgent(this.userAgent_.random().toString());
        this.ready_ = true;
    }

    public async authorize() {
        if (this.ready_) {
            await this.mutex_.waitForUnlock();
            await this.mutex_.acquire();
            await this.page_.goto('https://www.mtbproject.com/');

            await this.page_.click('a[data-target="#login-modal"]');

            await timeout(1500);

            await this.page_.waitForSelector(SelectorDict.Login.email);
            await this.page_.focus(SelectorDict.Login.email);
            await this.page_.type(SelectorDict.Login.email, this.username_, { delay: 87 });

            await this.page_.waitForSelector(SelectorDict.Login.password);
            await this.page_.focus(SelectorDict.Login.password);
            await this.page_.type(SelectorDict.Login.password, this.password_, { delay: 103 });

            try {
                await this.page_.click(SelectorDict.Login.submit);
                await this.page_.waitForNavigation();

                // TODO: Add a validation check to ensure we are logged in
                this.authorized_ = true;
                this.mutex_.release();
            }
            catch (err) {
                throw err;
                this.mutex_.release();
            }
        }
        else 
            throw new Error('Not initialized! `waitForInit()` must be run and complete on this object before it is usable');
    }

    public async updateTrail(trail: Trail): Promise<boolean> {
        if (this.authorized_) {
            await this.mutex_.waitForUnlock();
            await this.mutex_.acquire();

            const trailStatus = trail.status as Status;
            await this.page_.goto(`https://www.mtbproject.com/trail/${trail.mtbID}`, { waitUntil: 'networkidle0' });

            await this.page_.waitForSelector('a[data-target="#conditions-modal"]');
            await this.page_.click('a[data-target="#conditions-modal"]');

            await timeout(1500);

            await this.page_.waitForSelector(SelectorDict.UpdatePage.submit);

            switch(trailStatus.mtbStatus) {
                case 'Bad / Closed':
                    await this.page_.click(SelectorDict.UpdatePage.Dials.red);
                    break;
                case 'Minor Issues':
                    await this.page_.click(SelectorDict.UpdatePage.Dials.yellow);
                    break;
                case 'All Clear':
                    await this.page_.click(SelectorDict.UpdatePage.Dials.green);
            }

            for (const key of Object.keys(trailStatus.conditions)) {
                if (trailStatus.conditions[key] === true)
                    await this.page_.click((SelectorDict.UpdatePage.Conditions as any)[key]);
            }

            try {
                await Promise.all([
                    this.page_.waitForNavigation(),
                    this.page_.click(SelectorDict.UpdatePage.submit)
                ]);

                this.mutex_.release();

                // TODO: Add validation to ensure result was uploaded correctly
                return true;
            }
            catch (err) {
                throw err;
                this.mutex_.release();
            }
        }
        else {
            throw new Error('Not authorized! `authorize()` must be run and complete on this object before it is usable');
        }
    }

    public async kill() {
        await this.browser_.close();
    }
}