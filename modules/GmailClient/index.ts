import fs from 'fs';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export default class GmailClient {
    private static scopes_ = [
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.send',
    ];
    private static tokenPath_ = path.join(process.cwd(), 'token.json');
    private static credentialsPath_ = path.join(process.cwd(), 'credentials.json');
    
    private auth_: OAuth2Client | null;
    private gmail_: gmail_v1.Gmail;

    private async loadSavedCredentialsIfExist() {
        try {
            const content = await fs.promises.readFile(GmailClient.tokenPath_);
            const credentials = JSON.parse(content.toString());
            return google.auth.fromJSON(credentials) as OAuth2Client;
        } catch (err) {
            return null;
        }
    }

    private async saveCredentials(client: OAuth2Client) {
        const content = await fs.promises.readFile(GmailClient.credentialsPath_);
        const keys = JSON.parse(content.toString());
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.promises.writeFile(GmailClient.tokenPath_, payload);
    }

    private async authorize() {
        this.auth_ = await this.loadSavedCredentialsIfExist();
        if (this.auth_) {
            return;
        }
        this.auth_ = await authenticate({
            scopes: GmailClient.scopes_,
            keyfilePath: GmailClient.credentialsPath_,
        });
        if (this.auth_?.credentials) {
            await this.saveCredentials(this.auth_);
        }
    }

    public async waitForInit(): Promise<void> {
        await this.authorize();
        if (this.auth_)
            this.gmail_ = google.gmail({ version: 'v1', auth: this.auth_ });
        else
            throw new Error('Failed to authorize Gmail');
    }

    public async sendMessage(subject: string, message: string, sendToEmail: string) {
        if (this.auth_) {
            const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
            const messageParts = [
                'From: Justin Beckwith <beckwith@google.com>',
                `To: ${sendToEmail}`,
                'Content-Type: text/html; charset=utf-8',
                'MIME-Version: 1.0',
                `Subject: ${utf8Subject}`,
                '',
                message
            ];
            const email = messageParts.join('\n');
            const encodedEmail = Buffer.from(email)
                                       .toString('base64')
                                       .replace(/\+/g, '-')
                                       .replace(/\//g, '_')
                                       .replace(/=+$/, '');

            const res = await this.gmail_.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedEmail,
                }
            });

            return res;
        }
        else
            throw new Error('Failed to authorize Gmail. Did you call waitForInit() first?');
    }
}