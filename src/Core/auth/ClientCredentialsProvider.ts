import { TypedTokenProvider, BaseConfig, TokenHost, TokenPath } from "./TokenProvider";

import querystring from 'querystring';
import { fetch } from "../utility";

export interface ClientCredentials extends BaseConfig
{
    clientSecret: string,
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
