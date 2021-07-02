import { ApiConnection } from "..";
import Logger from "../logger";
import sha512 from "crypto-js/sha512";

import Store from './Store';

import { TypedEmitter } from 'tiny-typed-emitter';


const logger = new Logger('SessionManager');

const defaultRedirectUri = 'http://localhost:3000/logged-in';


interface Events
{
    'logged-in' : ()=>void,
    'logged-out' : ()=>void,
    'updated' : ()=>void
}

interface UserInfo
{
    userId:number;
    username:string;
}

export default class SessionManager extends TypedEmitter<Events>
{
    api:ApiConnection;

    userInfo?: UserInfo;

    store: Store;

    setupHttpsClient:()=>void;
    handleException:(e:any)=>void;

    constructor(api:ApiConnection, setupHttpsClient:()=>void, handleException:(e:any)=>void)
    {
        super();

        this.setMaxListeners(Number.MAX_SAFE_INTEGER);

        this.api = api;
        this.setupHttpsClient = setupHttpsClient
        this.handleException = handleException;
        
        this.store = new Store(api, 'window' in global ? window.localStorage : global.localStorage);
    }
    
    async refreshUser()
    {   
        const decoded = this.api.tokenProvider.token?.decoded;

        if (!!decoded)
        {
            var sub = decoded.client_sub || decoded.sub;

            if (!!sub)
            {
                var wasLoggedIn = !!this.userInfo;

                if (!!decoded.sub)
                {
                    this.userInfo = await this.api.tokenProvider.getUser();
                }
                else
                {
                    this.userInfo = { userId: sub, username: decoded.client_username };
                }
                
                if (!wasLoggedIn)
                {
                    logger.success("User ID: " + sub);

                    logger.success("Username: " + this.userInfo?.username);

                    this.emit('logged-in');
                }
            }
            
            this.emit('updated');
        }
    }

    hashPassword(password:string) : string
    {
        return sha512(password).toString();
    }

    // async loadResourceOwner(accessToken:object)
    // {
    //     if (this.api.clientConfig == undefined)
    //     {
    //         logger.error("SessionManager should only be created via api.createSessionManager()");
    //         return;
    //     }

    //     this.api.canRefresh = true;

    //     const client = new ResourceOwnerPassword(this.api.clientConfig);

    //     this.api.accessToken = client.createToken(accessToken);

    //     this.setupHttpsClient();
    // }

    // async loginResourceOwner(username:string, password:string, isHashed:boolean = false)
    // {
    //     if (this.api.clientConfig == undefined)
    //     {
    //         logger.error("SessionManager should only be created via api.createSessionManager()");
    //         return;
    //     }

    //     if (!isHashed)
    //     {
    //         password = this.hashPassword(password);
    //     }

    //     this.api.canRefresh = true;

    //     const tokenParams = {
    //         username,
    //         password,
    //         scope: this.api.config!.scope
    //     };
        
    //     const client = new ResourceOwnerPassword(this.api.clientConfig);
        
    //     try
    //     {   
    //         this.api.accessToken = await client.getToken(tokenParams);
    //     }
    //     catch (e)
    //     {
    //         this.handleException(e);

    //         throw e;
    //     }

    //     this.setupHttpsClient();
    // }

    // async checkLoggedInExternal()
    // {
    //     if (this.api.clientConfig == undefined)
    //     {
    //         logger.error("SessionManager should only be created via api.createSessionManager()");
    //         return false;
    //     }

    //     logger.info("Checking login");

    //     if (!this.api.accessToken)
    //     {
    //         var tokenString = this.store?.get('token');

    //         if (!!tokenString)
    //         {
    //             logger.info("Login cookie found");

    //             var token = JSON.parse(tokenString);

    //             if (!this.ssoClient)
    //             {
    //                 this.ssoClient = new AuthorizationCode(this.api.clientConfig);
    //             }

    //             this.api.accessToken = this.ssoClient.createToken(token);

    //             await this.setupHttpsClient();
    //         }
    //     }

    //     await this.api.checkRefresh();

    //     return !!this.api.accessToken;
    // }

    // async loginExternal()
    // {
    //     if (this.api.clientConfig == undefined)
    //     {
    //         logger.error("SessionManager should only be created via api.createSessionManager()");
    //         return;
    //     }

    //     if (await this.checkLoggedInExternal())
    //     {
    //         return;
    //     }

    //     try
    //     {   
    //         if (!this.ssoClient)
    //         {
    //             this.ssoClient = new AuthorizationCode(this.api.clientConfig);
    //         }

    //         const redirect_uri = this.api.config!.redirect_uri || defaultRedirectUri;
    //         const scope = this.api.config!.scope;

    //         const authorizationUri = this.ssoClient.authorizeURL({
    //             redirect_uri,
    //             scope,
    //             state: undefined
    //         });
            

    //         const popup = window.open(authorizationUri, this.getSize());

    //         if (!popup)
    //         {
    //             logger.error("Error showing popup");
    //         }
    //         else
    //         {
    //             logger.info("Showing popup");
    //         }
    //     }
    //     catch (e)
    //     {
    //         this.handleException(e);

    //         throw e;
    //     }
    // }
    
    // private getSize() 
    // {  
    //     const w = 600;
    //     const h = 800;

    //     // Fixes dual-screen position                         Most browsers      Firefox  
    //     var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : (global.screen as any).left;  
    //     var dualScreenTop = window.screenTop != undefined ? window.screenTop : (global.screen as any).top;  
                    
    //     var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : global.screen.width;  
    //     var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : global.screen.height;  
                    
    //     var left = ((width / 2) - (w / 2)) + dualScreenLeft;  
    //     var top = ((height / 2) - (h / 2)) + dualScreenTop;  

    //     return 'location=no,toolbar=no,width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;
    // }

    // async loginExternalCallback()
    // {
    //     if (!this.ssoClient)
    //     {
    //         if (!this.api.clientConfig)
    //         {
    //             logger.error("ap.initialize must be called prior to loginExternalCallback");
    //             return;
    //         }

    //         this.ssoClient = new AuthorizationCode(this.api.clientConfig);
    //     }

    //     if (!location.search.includes('?code=') &&
    //         (!location.hash || !location.hash.includes('?code=')))
    //     {
    //         return false;
    //     }

    //     console.log(location);
        
    //     const searchParams = new URLSearchParams(location.search);

    //     var code = searchParams.get('code');

    //     if (!code && !!location.hash)
    //     {
    //         const hashParams = new URLSearchParams(location.hash.substring(location.hash.indexOf('?')));
      
    //         code = hashParams.get('code');
    //     }

    //     if (!code)
    //     {
    //         return;
    //     }

    //     const options = 
    //     {
    //         code,
    //         redirect_uri: this.api.config!.redirect_uri || defaultRedirectUri
    //     };
    
    //     try
    //     {
    //         this.api.accessToken = await this.ssoClient!.getToken(options);

    //         this.store?.set('token', JSON.stringify(this.api.accessToken.token));
    //     }
    //     catch (e) 
    //     {
    //         this.handleException(e);

    //         throw e;
    //     }

    //     await this.setupHttpsClient();
    // }
    
    async logout()
    {
        this.store.clear();

        var isLoggedIn = !!this.userInfo;

        this.userInfo = undefined;

        this.api.canRefresh = false;
        this.api.headers = undefined;

        await this.api.tokenProvider.logout();

        if (isLoggedIn)
        {
            this.emit('logged-out');
        }
    }
}