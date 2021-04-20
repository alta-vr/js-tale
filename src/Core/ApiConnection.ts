import { ClientCredentials, AccessToken, Token, ModuleOptions, ResourceOwnerPassword } from 'simple-oauth2';
import decode from 'jwt-decode';
import fetchInternal from 'node-fetch';
import https from 'https';
import http from 'http';

import Config from './Config';
import Logger from '../logger';

import sha512 from "crypto-js/sha512";
import { TypedEmitter } from 'tiny-typed-emitter';

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

interface Events
{
    'logged-in' : ()=>void,
    'logged-out' : ()=>void,
    'updated' : ()=>void
}

export default class ApiConnection extends TypedEmitter<Events>
{
    config?:Config;
    clientConfig?:ModuleOptions<"client_id">;
    httpsAgent?: http.Agent;
    headers: any;
    accessToken?: AccessToken;
    decodedToken?: any;
    userId?: number;
    endpoint?: string;

    canRefresh:boolean = false;

    refresh?:Promise<void>;

    async initOffline(config: Config)
    {
        this.init(config);

        await this.setupHttpsClient();
    }

    private init(config: Config)
    {
        this.config = config;

        this.endpoint = config.endpoint || 'https://967phuchye.execute-api.ap-southeast-2.amazonaws.com/test/api/';
        
        this.clientConfig = {
            client: {
                id: config.client_id,
                secret: config.client_secret,
            },
            auth: {
                tokenHost: config.tokenHost || "https://accounts.townshiptale.com",
                tokenPath: "/connect/token",
                authorizePath: "/connect/authorize"
            }
        };
    }

    async login(config: Config)
    {
        this.init(config);

        if (this.clientConfig == undefined)
        {
            logger.error("Invalid client config");
            return;
        }

        const tokenParams = {
            scope: config.scope
        };

        const client = new ClientCredentials(this.clientConfig);
        
        try
        {   
            this.accessToken = await client.getToken(tokenParams);
        }
        catch (e)
        {
            this.handleException(e);

            throw e;
        }

        await this.setupHttpsClient();
    }

    async loginResourceOwner(username:string, password:string, isHashed:boolean = false)
    {
        if (this.clientConfig == undefined)
        {
            logger.error("Requires initOffline first");
            return;
        }

        if (!isHashed)
        {
            password = this.hashPassword(password);
        }

        this.canRefresh = true;

        const tokenParams = {
            username,
            password,
            scope: this.config!.scope
        };
        
        const client = new ResourceOwnerPassword(this.clientConfig);
        
        try
        {   
            this.accessToken = await client.getToken(tokenParams);
        }
        catch (e)
        {
            this.handleException(e);

            throw e;
        }

        await this.setupHttpsClient();
    }

    private handleException(e:any)
    {
        logger.fatal("Error getting access token");

        if (!!e.data && !!e.data.payload && e.data.isResponseError)
        {
            throw new Error(e.data.payload.error_description);
        }
        else if (!!e.output && !!e.output.payload)
        {
            throw e.output.payload;
        }
    }

    hashPassword(password:string) : string
    {
        return sha512(password).toString();
    }

    async loadResourceOwner(config:Config, accessToken:object)
    {
        this.init(config);
        
        if (this.clientConfig == undefined)
        {
            logger.error("Invalid client config");
            return;
        }

        this.canRefresh = true;

        const client = new ResourceOwnerPassword(this.clientConfig);

        this.accessToken = client.createToken(accessToken);

        this.setupHttpsClient();
    }

    private async setupHttpsClient()
    {
        logger.info("Setting up https client");

        if (this.accessToken != undefined)
        {
            logger.info("Deconding token");

            this.decodedToken = this.decodedToken || {};

            var decoded = decode(this.accessToken.token.access_token);
            
            Object.assign(this.decodedToken, decoded);
        }

        this.headers = {
            "Content-Type": "application/json",
            "x-api-key": "2l6aQGoNes8EHb94qMhqQ5m2iaiOM9666oDTPORf",
            "User-Agent": !!this.config ? this.config!.client_id : 'Unknown',
            "Authorization": !!this.accessToken ? ("Bearer " + this.accessToken.token.access_token) : undefined,
        };

        if (!this.httpsAgent)
        {
            this.httpsAgent = this.endpoint!.startsWith('https') ? new https.Agent() : new http.Agent();
        }

        if (!this.userId && !!this.decodedToken)
        {
            this.userId = this.decodedToken.client_sub || this.decodedToken.sub;

            logger.success("User ID: " + this.userId);

            if (!!this.decodedToken.client_username)
            {
                logger.success("Username: " + this.decodedToken.client_username);
            }

            this.emit('logged-in');
        }
        
        this.emit('updated');
    }

    private async checkRefresh()
    {
        if (this.accessToken == undefined)
        {
            return;
        }
    
        if (!this.refresh && this.accessToken.expired(15))
        {
            this.refresh = this.refreshInternal();
        }
        
        await this.refresh;
    }

    private async refreshInternal()
    {
        if (this.config === undefined || this.accessToken === undefined)
        {
            return;
        }
        
        logger.info("Refreshing session");

        var refreshParams = {
            scope: this.config.scope
        }

        try
        {
            if (this.canRefresh)
            {
                var result = await this.accessToken.refresh(refreshParams);

                if (this.accessToken !== undefined)
                {
                    this.accessToken = result;
                }
            }
            else
            {
                await this.login(this.config);
            }

            await this.setupHttpsClient();
        }
        catch (e)
        {
            logger.error(`Error refreshing token ${e.message}`);
        }
    }

    async fetch(method: HttpMethod, path: string, body: any | undefined = undefined)
    {
        await this.checkRefresh();

        logger.info("HEADERS");
        logger.info(this.headers);

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

    async logout()
    {
        if (this.accessToken !== undefined)
        {
            this.accessToken.revokeAll();

            this.accessToken = undefined;
            this.canRefresh = false;
            this.decodedToken = undefined;
            this.headers = undefined;
            this.httpsAgent = undefined;
            this.config = undefined;
            this.clientConfig = undefined;
            this.endpoint = undefined;

            
            this.emit('logged-out');
        }
    }
}
