import https from 'https';
import http from 'http';

import Config from './Config';
import Logger from '../logger';

import SessionManager from './SessionManager';

import { TokenProvider } from './auth/TokenProvider';

import { fetch } from './utility';
import { ClientCredentialsProvider } from './auth/ClientCredentialsProvider';

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
    config:Config;
    tokenProvider:TokenProvider;

    httpsAgent?: http.Agent;
    headers: any;

    canRefresh:boolean = false;

    refresh?:Promise<void>;

    sessionManager:SessionManager;

    constructor(config:Config)
    {        
        this.config = config;
        this.tokenProvider = TokenProvider.create(config, this.handleToken.bind(this));

        this.sessionManager = new SessionManager(this, this.setupHttpsClient, this.handleException);
    }

    async handleToken()
    {
        this.setupHttpsClient();

        await this.sessionManager.refreshUser();
    }

    async initialize()
    {
        if (this.tokenProvider instanceof ClientCredentialsProvider)
        {
            logger.info("Logging in with client credentials");

            try
            {   
                await this.tokenProvider.getToken();    
            }
            catch (e)
            {
                this.handleException(e);
    
                throw e;
            }
        }
        else
        {
            logger.info("Checking cookies for logged in user.");

            // await this.sessionManager.checkLoggedInExternal();
        }
    }

    private handleException(e:any)
    {
        logger.fatal("Error getting access token");
        
        logger.error(e.data);

        if (!!e.data && !!e.data.payload && e.data.isResponseError)
        {
            throw new Error(e.data.payload.error_description);
        }
        else if (!!e.output && !!e.output.payload)
        {
            throw e.output.payload;
        }
    }

    async getHeaders()
    {
        await this.tokenProvider.checkRefresh();

        return this.headers;
    }

    private setupHttpsClient()
    {
        logger.info("Setting up https client");

        this.headers = {
            "Content-Type": "application/json",
            "x-api-key": "2l6aQGoNes8EHb94qMhqQ5m2iaiOM9666oDTPORf",
            "User-Agent": !!this.config ? this.config.clientId : 'Unknown',
            "Authorization": !!this.tokenProvider.token ? ("Bearer " + this.tokenProvider.token.accessToken) : undefined,
        };

        if (!this.httpsAgent)
        {
            this.httpsAgent = this.config.endpoint?.startsWith('https') ? new https.Agent() : new http.Agent();
        }
    }

    async fetch(method: HttpMethod, path: string, body: any | undefined = undefined)
    {
        await this.tokenProvider.checkRefresh();
        
        return await fetch(this.config.endpoint + path, {
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
