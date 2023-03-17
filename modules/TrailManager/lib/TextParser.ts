import { AxiosResponse } from 'axios';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';
import crypto from 'crypto';
import sqlExecute from '../../SQLInterface';

type JSONRes = {
    closed?: string | boolean,
    reason?: string,
    tweet?: string
}

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

    private async parseJSONRes(json: JSONRes, status?: Status) {
        let result: Status = status || TextParser.createNewStatus() ;

        const checkAllConditionsFalse = (c: Conditions) => {
            for (const key in Object.keys(c)) {
                if (c[key] === true)
                    return false;
            }
            return true;
        };

        // Parse the "Is closed" part of the JSON
        if (result.open !== undefined) {
            if ((json.closed as string)?.toLowerCase() === 'true' || (json.closed as boolean) === true)
                result.open = false;
            else if ((json.closed as string)?.toLowerCase() === 'false' || (json.closed as boolean) === false)
                result.open = true;
        }

        // If failed to parse, return undefined
        if (result.open === undefined) return undefined;

        const normalizedReason = json.reason?.toLowerCase().replaceAll(/[!\"#\＄%&\'\(\)\*\+,-\./:;<=>\?@\[\\\]\^_`{\|}~]/g, '');

        if (normalizedReason !== undefined) {
            if (normalizedReason.includes('fallen') && normalizedReason.includes('trees'))
                result.conditions.fallenTrees = true;
            if (normalizedReason.includes('mud') || normalizedReason.includes('rain'))
                if (result.open === false)
                    result.conditions.muddy = true;
                else
                    result.conditions.someMud = true;
            if (normalizedReason.includes('snow'))
                result.conditions.snowy = true;
            if (normalizedReason.includes('ice') || normalizedReason.includes('icy'))
                result.conditions.icy = true;
        }
        
        if (checkAllConditionsFalse(result.conditions) && result.open === true)
            result.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "All Clear"'))[0].UUID;
        else if (result.open === true) {
            result.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "Minor Issues"'))[0].UUID;
            if (!result.danger) result.danger = json.tweet;
        }
        else if (result.open === false) {
            result.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "Bad / Closed"'))[0].UUID;
            if (!result.danger) result.danger = json.tweet;
        }

        if (result.mtbStatus !== undefined)
            return result;
        return undefined;
    }

    ////////////////// OPENAI PARSING ROUTE ////////////////////////
    private async submitTweet(tweet: string) {
        return await this.openai_.createCompletion({
            model: 'text-davinci-003',
            prompt: `If I said "${tweet}", in JSON format { "closed": "is place closed? true/false", "reason": "if true, why?" }`,
            temperature: 0,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
    }

    private convertDavinciToJSON(davinciRes: AxiosResponse<CreateCompletionResponse, any>) {
        const str = davinciRes.data.choices[0].text.trim();
        let result: JSONRes = undefined;
        try {
            result = JSON.parse(str);
        }
        catch (err) {
            console.error(err);
        } // TODO: Implement email error handling
        return result;
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

        result = await this.parseJSONRes({ 
            closed: result.open ? 'false' : 'true',
            reason: normalizedTweet
        }, result);

        return result;
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