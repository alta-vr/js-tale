import jwtDecode from "jwt-decode";
import { HttpError } from "../ApiConnection";
import Config from "../Config";
import { fetch } from "../utility";

import querystring from 'querystring';
import Logger from "../../logger";

const logger = new Logger('TokenProvider');

export interface BaseConfig
{
    clientId: string;

    tokenHost?: string;
    endpoint?: string;

    scope:string|string[];
}

export const LocalHost = "http://localhost:13490/api/";
export const Cloud = "https://967phuchye.execute-api.ap-southeast-2.amazonaws.com/"

export const TokenHost = "https://accounts.townshiptale.com";
export const Endpoint = "prod";
export const TokenPath = "/connect/token";
export const AuthorizePath = "/connect/authorize";
export const UserInfoPath = '/connect/userinfo';
export const RevokePath = '/connect/revoke';

const ExpirationBufferMs = 15000;

function resolveEndpoint(endpoint:string)
{
    if (endpoint.startsWith('http'))
    {
        return endpoint;
    } 
    
    if (endpoint == "local")
    {
        return LocalHost;
    } 
    
    return `${Cloud}${endpoint}/api/`;
}

interface TokenResult
{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
    scope: string;
}

class Token
{
    accessToken:string;
    refreshToken?:string;
    decoded:any;
    
    expiry:number;
    scope:string;

    constructor(data: TokenResult)
    {
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.expiry = data.expires_at!;
        this.scope = data.scope;

        this.decoded = jwtDecode(this.accessToken);
    }

    async revoke()
    {
        await this.revokeInternal('access_token', this.accessToken);

        if (!!this.refreshToken)
        {
            await this.revokeInternal('refresh_token', this.refreshToken);
        }
    }
    
    private revokeInternal(tokenType:'access_token'|'refresh_token', token:string)
    {
        var headers = {
            'Content-Type' : 'application/x-www-form-urlencoded'
        };

        var body = querystring.stringify({
            token_type_hint: tokenType,
            token
        });

        return fetch(`${TokenHost}${RevokePath}`, {
            headers,
            method: 'POST',
            body
        });
    }
}

export abstract class TokenProvider
{
    token?:Token;

    private handleToken:()=>Promise<void>;
    
    private currentRefresh:Promise<void>|undefined;

    constructor(handleToken:()=>Promise<void>)
    {
        this.handleToken = handleToken;
    }

    protected abstract getConfig() : BaseConfig;

    protected async setToken(tokenResult:TokenResult)
    {
        if (!tokenResult.expires_at)
        {
            tokenResult.expires_at = Date.now() + tokenResult.expires_in * 1000;
        }

        this.token = new Token(tokenResult);

        await this.handleToken();
    }

    async getUser()
    {
        try
        {
            const path = `${this.getConfig().tokenHost}${UserInfoPath}`;

            const result = await fetch(path, 
            { 
                headers : {
                    'Authorization': `Bearer ${this.token!.accessToken}`
                },
                method: 'GET'
            })
            .then(res =>
            {
                if (res.ok)
                {
                    return res.json();
                }

                throw new HttpError('GET', path, res.status,  res.statusText);
            });

            console.log("USER RESULT:");
            console.log(result);

            return result;
        }
        catch (e)
        {
            console.error("Error refreshing userinfo");
            console.error(e);
            
            throw e;
        }
    }

    async logout()
    {
        if (!!this.token)
        {
            await this.token.revoke();
        }

        this.token = undefined;
        
        await this.handleToken();
    }
    
    async checkRefresh()
    {
        if (this.token == undefined)
        {
            return;
        }
    
        if (!this.currentRefresh && this.token.expiry - (Date.now() + ExpirationBufferMs) <= 0)
        {
            this.currentRefresh = this.refresh()
            .then(() => 
            {
                if (!!this.token && this.token.expiry - (Date.now() + ExpirationBufferMs) <= 0)
                {
                    logger.error("Could not refresh token");
                    return this.logout();
                }
            })
            .catch(e =>
            {
                logger.error("Error refreshing token");
                logger.error(e);

                return this.logout();
            });
        }
        
        if (!!this.currentRefresh)
        {
            await this.currentRefresh;

            this.currentRefresh = undefined;
        }
    }

    protected async refresh() 
    {

    }
}

export class TypedTokenProvider<T extends BaseConfig> extends TokenProvider
{
    config:T;

    constructor(config:T, handleToken:()=>Promise<void>)
    {
        super(handleToken);

        config.tokenHost = config.tokenHost || TokenHost;
        config.endpoint = resolveEndpoint(config.endpoint || Endpoint);
        
        if (Array.isArray(config.scope))
        {
            config.scope = config.scope.join(' ');
        }

        this.config = config;
    }

    getConfig()
    {
        return this.config;
    }
}