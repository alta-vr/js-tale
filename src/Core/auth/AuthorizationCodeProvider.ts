import Logger from "../../logger";
import Store from "../Store";
import { AuthorizePath, BaseConfig, TokenHost, TokenPath, TypedTokenProvider } from "./TokenProvider";

import crypto from 'crypto';
import querystring from 'querystring';

const logger = new Logger('TokenProvider');

export interface AuthorizationCode extends BaseConfig
{
    redirectUri: string;
}

export class AuthorizationCodeProvider extends TypedTokenProvider<AuthorizationCode>
{
    store:Store;

    constructor(config:AuthorizationCode, handleToken:()=>Promise<void>)
    {
        super(config, handleToken);

        this.store = new Store(config.clientId, 'window' in global ? window.localStorage : global.localStorage);
    }

    async logout()
    {
        this.store.clear();

        super.logout();
    }

    async checkLoggedInExternal()
    {
        logger.info("Checking login");

        if (!this.token)
        {
            var tokenString = this.store.get('token');

            if (!!tokenString)
            {
                logger.info("Login cookie found");

                var token = JSON.parse(tokenString);

                await this.setToken(token);
            }
        }

        await this.checkRefresh();

        return !!this.token;
    }

    private base64URLEncode(str:Buffer)
    {
        return str.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    
    private createVerifier() 
    {
        return this.base64URLEncode(crypto.randomBytes(32));
    };

    private async createChallenge(verifier:string)
    {
        return this.base64URLEncode(crypto.createHash('sha256').update(verifier).digest());
    }

    private authorizeEndpoint()
    {        
        const { clientId, scope, redirectUri } = this.config;

        const verifier = this.createVerifier();
        const challenge = this.createChallenge(verifier);

        this.store.set('authorizeState', JSON.stringify({ verifier }));

        var url = `${TokenHost}${AuthorizePath}?` +
        `client_id=${clientId}&` +
        `scope=${scope}&` +
        'response_type=code&' +
        `code_challenge=${challenge}&` +
        `code_challenge_method=S256` + 
        `redirect_uri=${redirectUri}`;

        return url;
    }

    async loginExternal()
    {
        if (await this.checkLoggedInExternal())
        {
            return;
        }

        try
        {   
            const authorizationUri = this.authorizeEndpoint();
            
            const popup = window.open(authorizationUri, this.getSize());

            if (!popup)
            {
                logger.error("Error showing popup");
            }
            else
            {
                logger.info("Showing popup");
            }
        }
        catch (e)
        {
            logger.error("Error showing login");
            logger.error(e);
        }
    }
    
    private getSize() 
    {  
        const w = 600;
        const h = 800;

        // Fixes dual-screen position                         Most browsers      Firefox  
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : (global.screen as any).left;  
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : (global.screen as any).top;  
                    
        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : global.screen.width;  
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : global.screen.height;  
                    
        var left = ((width / 2) - (w / 2)) + dualScreenLeft;  
        var top = ((height / 2) - (h / 2)) + dualScreenTop;  

        return 'location=no,toolbar=no,width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;
    }

    async loginExternalCallback()
    {
        if (!location.search.includes('?code=') &&
            (!location.hash || !location.hash.includes('?code=')))
        {
            return false;
        }
        
        const searchParams = new URLSearchParams(location.search);

        var code = searchParams.get('code');

        if (!code && !!location.hash)
        {
            const hashParams = new URLSearchParams(location.hash.substring(location.hash.indexOf('?')));
      
            code = hashParams.get('code');
        }

        if (!code)
        {
            return;
        }

        var authorizeState = this.store.get('authorizeState');

        if (!authorizeState)
        {
            throw new Error("No authorize state found");
        }

        var { verifier } = JSON.parse(authorizeState);

        var headers = {
            'Content-Type' : 'application/x-www-form-urlencoded'
        }

        var parameters = {
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.config.redirectUri,
            client_id: this.config.clientId,
            code_verifier: verifier,
        }
        
        var response = await fetch(`${TokenHost}${TokenPath}`, {
            method: 'POST',
            headers,
            body : querystring.stringify(parameters)
        });

        var value = await response.json();
        
        this.store?.set('token', JSON.stringify(value));

        await this.setToken(value);
    }

    async refresh()
    {
        logger.error("Refresh not yet implemented");
    }
}