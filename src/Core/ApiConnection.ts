import { ClientCredentials } from 'simple-oauth2';
import decode from 'jwt-decode';
import fetchInternal from 'node-fetch';
import https from 'https';
import http from 'http';

import Config from './Config';
import Logger from '../logger';

export type HttpMethod = 'POST' | 'DELETE' | 'GET' | 'PUT' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export class HttpError
{
    method:HttpMethod;
    path:string;
    code:number;
    message:string;

    constructor(method:HttpMethod, path:string, code:number, message:string)
    {
        this.method = method;
        this.path = path;
        this.code = code;
        this.message = message;
    }
}

export interface UserInfo
{
    id: number;
    username: string;
}

const logger = new Logger('ApiConnection');

export default class ApiConnection
{
    httpsAgent: http.Agent | undefined;
    headers: any;
    accessToken: string | undefined;
    userId: number | undefined;
    endpoint: string | undefined;

    async login(config: Config)
    {
        const clientConfig = {
            client: {
                id: config.client_id,
                secret: config.client_secret
            },
            auth: {
                tokenHost: "https://accounts.townshiptale.com",
                tokenPath: "/connect/token"
            }
        };

        this.endpoint = config.endpoint || 'https://967phuchye.execute-api.ap-southeast-2.amazonaws.com/test/api/';

        const tokenParams = {
            scope: config.scope
        };

        const client = new ClientCredentials(clientConfig);
        
        try
        {
            this.accessToken = (await client.getToken(tokenParams)).token.access_token;
        }
        catch (e)
        {
            try
            {
                logger.fatal(e.data.payload.error);
            }
            catch
            {
                logger.error("Unknown error");
                logger.info(e);
            }

            return;
        }

        this.headers = {
            "Content-Type": "application/json",
            "x-api-key": "2l6aQGoNes8EHb94qMhqQ5m2iaiOM9666oDTPORf",
            "User-Agent": config.client_id,
            "Authorization": "Bearer " + this.accessToken,
        };

        this.httpsAgent = this.endpoint.startsWith('https') ? new https.Agent() : new http.Agent();

        var token = decode(this.accessToken as string) as any;
        this.userId = token.client_sub;

        logger.success("User ID: " + this.userId);
        logger.success("Username: " + token.client_username);
    }

    async fetch(method: HttpMethod, path: string, body: any | undefined = undefined)
    {
        return await fetchInternal(this.endpoint + path, {
            headers: this.headers,
            method,
            agent: this.httpsAgent,
            body: JSON.stringify(body)
        }).then(res =>
        {
            if (res.ok)
            {
                return res;
            }

            throw new HttpError(method, path, res.status,  res.statusText);
        })
        .then(res =>
        {
            return res.json();
        });
    }

    async resolveUsernameOrId(value:string|number)
    {
        if (typeof value == 'string')
        {
            var parsed = parseInt(value);

            if (!isNaN(parsed))
            {
                return parsed;
            }
            
            return await this.fetch("POST", "users/search/username", { username: value }).then(result => result.id);
        }

        return value;
    }
}
