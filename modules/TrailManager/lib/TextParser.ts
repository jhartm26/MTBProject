import { AxiosResponse } from 'axios';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';
import crypto from 'crypto';
import sqlExecute from '../../SQLInterface';

type JSONRes = {
    closed?: string,
    tweet?: string,
    conditions?: {
        [index: string]: string,
        dry?: string,
        mostlyDry?: string,
        muddy?: string,
        someMud?: string,
        snowy?: string,
        icy?: string,
        fallenTrees?: string
    }
}

const checkAllConditionsFalse = (c: Conditions) => {
    for (const key of Object.keys(c)) {
        if (c[key] === true)
            return false;
        if (c[key] === undefined)
            return undefined;
    }
    return true;
};

const DavinciPrompt = 
'If I said "{{tweet}}", in JSON format: {"closed":"t/f","conditions": {"dry": "t/f","mostlyDry": "t/f","muddy": "t/f","someMud": "t/f","snowy": "t/f","icy": "t/f","fallenTrees": "t/f"}}';

export default class TextParser {
    private configuration_: Configuration;
    private openai_: OpenAIApi;

    constructor() {
        this.configuration_ = new Configuration({
            organization: process.env.OPENAI_ORG_ID,
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.openai_ = new OpenAIApi(this.configuration_);
    }

    private static createNewStatus(): Status {
        return {
            UUID: crypto.randomUUID(),
            open: undefined,
            danger: '',
            createdOn: new Date(),
            mtbStatus: undefined,
            conditions: {
                dry: false,
                mostlyDry: false,
                muddy: false,
                someMud: false,
                snowy: false,
                icy: false,
                fallenTrees: false
            }
        };
    }
    ////////////////// OPENAI PARSING ROUTE ////////////////////////
    private async submitTweet(tweet: string) {
        return await this.openai_.createCompletion({
            model: 'text-davinci-003',
            prompt: DavinciPrompt.replace('{{tweet}}', tweet),
            temperature: 0,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
    }

    private convertDavinciToJSON(davinciRes: AxiosResponse<CreateCompletionResponse, any>) {
        const str = davinciRes.data.choices[0].text.trim();
        const jsonExtract = str.substring(str.indexOf('{'), str.lastIndexOf('}') + 1);
        let result: JSONRes = undefined;
        try {
            result = JSON.parse(jsonExtract);
        }
        catch (err) {
            console.error(err);
        } // TODO: Implement email error handling
        return result;
    }

    private async parseJSONRes(json: JSONRes) {
        let result: Status = TextParser.createNewStatus() ;

        // Parse the "Is closed" part of the JSON
        if (json.closed?.toLowerCase().includes('t'))
            result.open = false;
        else if (json.closed?.toLowerCase().includes('f'))
            result.open = true;

        // If failed to parse, return undefined
        if (result.open === undefined) return undefined;

        for (const key of Object.keys(json.conditions)) {
            if (Object.keys(result.conditions).includes(key)) {
                if (json.conditions[key]?.toLowerCase().includes('t'))
                    result.conditions[key] = true;
                else if (json.conditions[key]?.toLowerCase().includes('f'))
                    result.conditions[key] = false;
                else
                    result.conditions[key] = undefined;
            }
        }

        const allCondFalse = checkAllConditionsFalse(result.conditions);
        
        if (allCondFalse === undefined)
            return undefined;

        if (allCondFalse && result.open === true)
            result.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "All Clear"'))[0].UUID;
        else if (result.open === true) {
            result.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "Minor Issues"'))[0].UUID;
            result.danger = json.tweet;
        }
        else if (result.open === false) {
            result.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "Bad / Closed"'))[0].UUID;
            result.danger = json.tweet;
        }

        if (result.mtbStatus !== undefined)
            return result;
        return undefined;
    }
    ////////////////// OPENAI PARSING ROUTE ////////////////////////

    ////////////////// VANILLA PARSING ROUTE ////////////////////////
    private async attemptVanillaParse(tweet: string) {
        // Lowercase and remove punctuation
        const normalizedTweet = tweet.toLowerCase().replaceAll(/[!\"#\＄%&\'\(\)\*\+,-\./:;<=>\?@\[\\\]\^_`{\|}~]/g, '');

        let result = TextParser.createNewStatus();

        if (normalizedTweet.includes('open'))
            result.open = true;
        else if (normalizedTweet.includes('closed')) {
            result.open = false;
            result.danger = tweet;
        }

        if (result.open === undefined) return undefined;

        result = await this.parseConditions(normalizedTweet, result);

        return result;
    }

    private async parseConditions(nTweet: string, status: Status): Promise<Status> {
        const checkForSnow = (str: string) => {
            let result = false;
            if (str.includes('snow')) result = true;
            if (str.search(/((is)((n't)|( not)))|(not?)([ \r\n\t]+snowy?i?n?g?)/g) !== -1) result = false;
            return result;
        };

        const checkForMud = (str: string) => {
            let result = false;
            if (str.includes('mud')) result = true;
            if (str.search(/((is)((n't)|( not)))|(not?)([ \r\n\t]+mud(dy)?)/g) !== -1) result = false;
            return result;
        };

        const checkForIce = (str: string) => {
            let result = false;
            if (str.includes('ice') || str.includes('froze')) result = true;
            if (str.search(/((is)((n't)|( not)))|(not?)([ \r\n\t]+froze(n)?)/g) !== -1) result = false;
            if (str.search(/((is)((n't)|( not)))|(not?)([ \r\n\t]+ice)/g) !== -1) result = false;
            return result;
        };

        const checkForTrees = (str: string) => {
            let result = false;
            if (str.search(/((fall(en)?)|(fell))+[ \r\n\t]+(trees?)/g) !== -1) result = true;
            if (str.search(/(trees?)((have)|(are)|(did))?[ \r\n\t]+((fall(en)?)|(fell))?/g)) result = true;
            if (str.search(/((is)((n't)|( not)))|(not?)([ \r\n\t]+)(trees?)((have)|(are)|(did))?[ \r\n\t]+((fall(en)?)|(fell))?/) !== -1) result = false;
            if (str.search(/((is)((n't)|( not)))|(not?)([ \r\n\t]+)((fall(en)?)|(fell))+[ \r\n\t]+(trees?)/)) result = false;
            return result;
        };

        const isMuddy = checkForMud(nTweet);

        status.conditions = {
            dry: status.open && !isMuddy,
            mostlyDry: false,
            muddy: status.open ? false : isMuddy,
            someMud: status.open ? isMuddy : false,
            snowy: checkForSnow(nTweet),
            icy: checkForIce(nTweet),
            fallenTrees: checkForTrees(nTweet)
        };

        if (checkAllConditionsFalse(status.conditions) && status.open === true)
            status.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "All Clear"'))[0].UUID;
        else if (status.open === true)
            status.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "Minor Issues"'))[0].UUID;
        else if (status.open === false)
            status.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "Bad / Closed"'))[0].UUID;

        return status;
    }
    ////////////////// VANILLA PARSING ROUTE ////////////////////////

    public async parseTweetToStatus(tweet: string): Promise<Status> {
        try {
            const vAttempt = this.attemptVanillaParse(tweet);
            if (vAttempt !== undefined)
                return vAttempt;
            
            const res = await this.submitTweet(tweet);
            const json = this.convertDavinciToJSON(res);
            if (json) json.tweet = tweet;
            return await this.parseJSONRes(json);
        }
        catch (err) {
            console.error(err);
            return undefined;
        }
    }
}