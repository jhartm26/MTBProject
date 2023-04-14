import { AxiosResponse } from 'axios';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';
import path from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import crypto from 'crypto';
import winston from 'winston';
import { Mutex } from 'async-mutex';

import GmailClient from '../../GmailClient';
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
        if (!key.toLowerCase().includes('dry')) {
            if (c[key] === true)
                return false;
            if (c[key] === undefined)
                return undefined;
        }
    }
    return true;
};

const DavinciPrompt = 
'If I said "{{tweet}}", in JSON format: {"closed":"t/f","conditions": {"dry": "t/f","mostlyDry": "t/f","muddy": "t/f","someMud": "t/f","snowy": "t/f","icy": "t/f","fallenTrees": "t/f"}}';

export default class TextParser {
    private configuration_: Configuration;
    private openai_: OpenAIApi;
    private logger_: winston.Logger;
    private predictor_: ChildProcessWithoutNullStreams;
    private predictorMutex_: Mutex;
    private initialized_: boolean;
    private errored_: boolean;
    private errorMessage_: string;
    private gmailClient_: GmailClient;
    // const predictorProcess = spawn('python3', [path.join(__dirname, '../mlModels/predictOpen.py'), tweet]);

    constructor() {
        this.gmailClient_ = new GmailClient();
        this.predictorMutex_ = new Mutex();
        this.configuration_ = new Configuration({
            organization: process.env.OPENAI_ORG_ID,
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.openai_ = new OpenAIApi(this.configuration_);
        this.logger_ = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: [new winston.transports.File({
                filename: 'parsing.log'
            })]
        });
        this.predictorMutex_.acquire().then(() => {
            this.predictor_ = spawn('python3', [path.join(__dirname, '../mlModels/v2/predictOpen.py')]);

            this.predictor_.on('error', (err) => {
                console.error(err);
                process.exit(1);
            });

            this.predictor_.stdout.once('data', data => {
                if (data.toString().trim() === 'init') {
                    this.initialized_ = true;
                    this.predictor_.stderr.removeAllListeners();
                }
                else {
                    this.errorMessage_ = 'Incorrect init message sent to console';
                    this.errored_ = true;
                }

                this.predictorMutex_.release();
            });

            this.predictor_.stderr.once('data', data => {
                this.errorMessage_ = data.toString();
                this.errored_ = true;
            });
        });
    }

    public killPredictor = () => {
        if (!this.predictor_.kill())
            this.logger_.error('Failed to kill child process, please manual kill');
    };

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
    private attemptVanillaParse(tweet: string): Promise<{ vAttempt: Status, continueParse: boolean }> {
        // Lowercase and remove punctuation
        if (this.errored_ || !this.initialized_)
            throw new Error(this.errorMessage_ || 'Failed to wait for initialization');
        return new Promise(async (resolve, reject) => {
            let result = TextParser.createNewStatus();
            this.predictorMutex_.acquire().then(() => {
                this.predictor_.stdout.once('data', async (data) => {
                    try {
                        const prediction = JSON.parse(data.toString().trim().replace(/\'/g, '"')
                                                        .replace(/\\"/g, '\\\'').replace(/array\(/g, '')
                                                        .replace(/\)/g, '').replace(/, dtype=".+?"/g, ''));
                        this.logger_.log('info', 'OUR Prediction Information: ' + JSON.stringify(prediction));

                        if (prediction.parseability < 0.85 && prediction.parseability > 0.35) {
                            this.logger_.log('info', 'Prediction lacks confidence, attempting OpenAI route...');
                            resolve({ vAttempt: undefined, continueParse: true });
                        }
                        else if (prediction.parseability <= 0.35) {
                            this.logger_.log('info', 'Unparseable, skipping...');
                            resolve({ vAttempt: undefined, continueParse: false });
                        }

                        result.open = prediction.probabilities[0] >= 0.85 ? true : prediction.probabilities[0] <= 0.15 ? false : undefined;
                        if (result.open === undefined) {
                            this.logger_.log('info', 'Unexpected output or tweet could not be parsed for prediction, attempting OpenAI route...');
                            this.logger_.log('info', prediction);
                            resolve({ vAttempt: undefined, continueParse: prediction.parseability < 0.35 });
                        }
                        result.conditions = {
                            dry: prediction.probabilities[1] >= 0.85 ? true : prediction.probabilities[1] <= 0.15 ? false : false,
                            mostlyDry: prediction.probabilities[2] >= 0.85 ? true : prediction.probabilities[2] <= 0.15 ? false : false,
                            muddy: prediction.probabilities[3] >= 0.85 ? true : prediction.probabilities[3] <= 0.15 ? false : false,
                            someMud: prediction.probabilities[4] >= 0.85 ? true : prediction.probabilities[4] <= 0.15 ? false : false,
                            snowy: prediction.probabilities[5] >= 0.85 ? true : prediction.probabilities[5] <= 0.15 ? false : false,
                            icy: prediction.probabilities[6] >= 0.85 ? true : prediction.probabilities[6] <= 0.15 ? false : false,
                            fallenTrees: prediction.probabilities[7] >= 0.85 ? true : prediction.probabilities[7] <= 0.15 ? false : false,
                        };

                        if (checkAllConditionsFalse(result.conditions) && result.open === true)
                            result.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "All Clear"'))[0].UUID;
                        else if (result.open === true)
                            result.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "Minor Issues"'))[0].UUID;
                        else if (result.open === false)
                            result.mtbStatus = (await sqlExecute('SELECT UUID FROM mtb_statuses WHERE status = "Bad / Closed"'))[0].UUID;

                        this.logger_.log('info', 'Final parsed result: ' + JSON.stringify(result));
        
                        resolve({ vAttempt: result, continueParse: false });
                    }
                    catch (err) {
                        console.error(err.toString().trim());
                        reject(err);
                    }

                    this.predictor_.stderr.removeAllListeners();
                    this.predictorMutex_.release();
                });

                this.predictor_.stderr.once('data', (data) => {
                    console.error(data.toString().trim());
                    reject(new Error(data.toString().trim()));
                });

                this.predictor_.stdin.write(tweet + '\n', (err) => {
                    if (err)
                        this.logger_.error(err.toString().trim());
                });
            });
        });
    }
    ////////////////// VANILLA PARSING ROUTE ////////////////////////

    public waitForInit(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.gmailClient_.waitForInit();
            }
            catch (err) {
                console.error(err);
                reject(err);
            }
            const t = setInterval(() => {
                if (this.initialized_) {
                    clearInterval(t);
                    resolve();
                }
                if (this.errored_)
                    reject(new Error(this.errorMessage_));
            }, 5);
        });
    }

    public async parseTweetToStatus(tweet: string): Promise<Status> {
        this.logger_.log('info', `Parsing tweet: "${tweet}"`);
        try {
            const { vAttempt, continueParse } = await this.attemptVanillaParse(tweet);
            if (vAttempt !== undefined) {
                vAttempt.danger = tweet;
                await this.gmailClient_.sendMessage('Parsed Vanilla Result', 
                `Received tweet "${tweet}" and parsed with the following result:\n\n<pre>${JSON.stringify(vAttempt, null, 4)}</pre>`,
                'jgraygo@kent.edu');
                return vAttempt;
            }
            await this.gmailClient_.sendMessage('Vanilla Attempt Failed', 
            `Failed to parse tweet "${tweet}" using the vanilla route, please add to model training`,
            'jgraygo@kent.edu');
            
            if (continueParse) {
                try {
                    const res = await this.submitTweet(tweet);
                    const json = this.convertDavinciToJSON(res);
                    this.logger_.log('info', 'OpenAI response: ' + JSON.stringify(json));
                    if (json) json.tweet = tweet;
                    const result = await this.parseJSONRes(json);
                    this.logger_.log('info', 'Final result: ' + JSON.stringify(result));
                    await this.gmailClient_.sendMessage('Parsed OpenAI Result', 
                    `Received tweet "${tweet}" and parsed with the following result:\n\n<pre>${JSON.stringify(result, null, 4)}</pre>`,
                    'jgraygo@kent.edu');
                    return result;
                }
                catch {}
            }

            if (continueParse) {
                this.logger_.log('info', 'Tweet could not be parsed, sending for error handling');
                await this.gmailClient_.sendMessage('Parse Totally Failed', 
                `Failed to parse tweet "${tweet}" using the <b>ALL</b> routes, please add to model training`,
                'jgraygo@kent.edu');
            }
            else
                await this.gmailClient_.sendMessage('Tweet flagged as noparse', 
                `Failed to parse tweet "${tweet}", but tweet was flagged as 'noparse'. Please validate until the model is trained`,
                'jgraygo@kent.edu');

            return undefined;
        }
        catch (err) {
            console.error(err);
            return undefined;
        }
    }
}