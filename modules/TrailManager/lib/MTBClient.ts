import { Mutex } from 'async-mutex';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import UserAgent from 'user-agents';

puppeteer.use(StealthPlugin());
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: process.env.CAPTCHA_API_KEY
        }
    })
);

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default class MTBClient {

    private username_: string = process.env.MTB_USER || 'kentstatereview@gmail.com';
    private password_: string = process.env.MTB_PASS || '1234567890';
    private userAgent_: UserAgent;

    private browser_: Browser;
    private page_: Page;

    private ready_ = false;

    constructor() { 
        this.userAgent_ = new UserAgent();
    }

    public async waitForInit() {
        this.browser_ = await puppeteer.launch({ headless:false });
        this.page_ = await this.browser_.newPage();
        await this.page_.setUserAgent(this.userAgent_.random().toString());
        this.ready_ = true;
    }

    public async authorize() {
        const emailInputSelector = 'form[action="https://www.mtbproject.com/auth/login/email"] > div > input[type="email"]';
        const passwordInputSelector = 'form[action="https://www.mtbproject.com/auth/login/email"] > div > input[type="password"]';
        const loginButtonSelector = 'form[action="https://www.mtbproject.com/auth/login/email"] > button';

        // console.log(this);
        await this.page_.goto('https://www.mtbproject.com/');

        // console.log(await this.page_.solveRecaptchas());
        await this.page_.click('a[data-target="#login-modal"]');
        await this.page_.type(emailInputSelector, this.username_, { delay: 23 });
        await this.page_.type(passwordInputSelector, this.password_, { delay: 103 });

        console.log(await this.page_.solveRecaptchas());

        try {
            await Promise.all([
                this.page_.waitForNavigation(),
                this.page_.click(loginButtonSelector)
            ]);
        }
        catch (err) {
            console.error(err);
        }
        // await this.page_.waitForNavigation();
        await this.page_.screenshot({path: 'screenshot.png', fullPage: true });
        // console.log(loginButton);
        // await loginButton.click();
        
        // const emailInput = await this.page_.waitForSelector('input[type="email"]');
        // console.log(emailInput);
        // await emailInput.evaluate(el => {
        //     console.log(el);
        //     console.log('Teehee');
        // });
    }
}