import jwtDecode from "jwt-decode";
import { HttpError } from "../ApiConnection";
import Config from "../Config";
import { fetch } from "../utility";

import querystring from 'querystring';

interface BaseConfig
{
    clientId: string;

    tokenHost?: string;
    endpoint?: string;

    scope:string|string[];
}

export interface ClientCredentials extends BaseConfig
{
    clientSecret: string,
}

export interface AuthorizationCode extends BaseConfig
{
    redirect_uri: string;
}

const LocalHost = "http://localhost:13490/api/";
const Cloud = "https://967phuchye.execute-api.ap-southeast-2.amazonaws.com/"

const TokenHost = "https://accounts.townshiptale.com";
const Endpoint = "prod";
const TokenPath = "/connect/token";
const AuthorizePath = "/connect/authorize";
const UserInfoPath = '/connect/userinfo';
const RevokePath = '/connect/revoke';

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
        this.expiry = Date.now() + data.expires_in * 1000;
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

    handleToken:()=>Promise<void>;
    
    private currentRefresh:Promise<void>|undefined;

    constructor(handleToken:()=>Promise<void>)
    {
        this.handleToken = handleToken;
    }

    static create(config:Config, handleToken:()=>Promise<void>) : TokenProvider
    {
        if ('clientSecret' in config)
        {
            return new ClientCredentialsProvider(config, handleToken);
        }
        else
        {
            return new AuthorizationCodeProvider(config, handleToken);
        }
    }

    protected abstract getConfig() : BaseConfig;

    protected async setToken(tokenResult:TokenResult)
    {
        this.token = new Token(tokenResult);

        await this.handleToken();
    }

    async getUser()
    {
        try
        {
            var path = `${this.getConfig().tokenHost}${UserInfoPath}`;

            return await fetch(path, 
            { 
                headers : {
                    'Authorization': `Bearer: ${this.token}`
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
        }
        catch (e)
        {
            console.error("Error refreshing userinfo");
            console.error(e);
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
            this.currentRefresh = this.refresh();
        }
        
        if (!!this.currentRefresh)
        {
            await this.currentRefresh;

            this.currentRefresh = undefined;
        }
    }

    protected async refresh() {}
}

class TypedTokenProvider<T extends BaseConfig> extends TokenProvider
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

export class ClientCredentialsProvider extends TypedTokenProvider<ClientCredentials>
{
    constructor(config:ClientCredentials, handleToken:()=>Promise<void>)
    {
        super(config, handleToken);
    }

    protected async refresh()
    {
        await this.getToken();
    }

    async getToken()
    {
        var headers = {
            'Authorization' : `Basic ${this.encodeClient()}`,
            'Content-Type' : 'application/x-www-form-urlencoded'
        }

        var parameters = {
            grant_type: 'client_credentials',
            scope: this.config.scope,
        }
        
        var response = await fetch(`${TokenHost}${TokenPath}`, {
            method: 'POST',
            headers,
            body : querystring.stringify(parameters)
        });

        var value = await response.json();

        await this.setToken(value);
    }

    private encodeClient()
    {
        var id = encodeURIComponent(this.config.clientId).replace(/%20/g, '+');
        var secret = encodeURIComponent(this.config.clientSecret).replace(/%20/g, '+');

        return Buffer.from(`${id}:${secret}`).toString('base64');
    }
} 

export class AuthorizationCodeProvider extends TypedTokenProvider<AuthorizationCode>
{
    constructor(config:AuthorizationCode, handleToken:()=>Promise<void>)
    {
        super(config, handleToken);

    }
}