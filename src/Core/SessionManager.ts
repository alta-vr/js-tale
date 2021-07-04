import { ApiConnection } from "..";
import Logger from "../logger";
import sha512 from "crypto-js/sha512";

import Store from './Store';

import { TypedEmitter } from 'tiny-typed-emitter';
import { UserInfo } from "./ApiConnection";


const logger = new Logger('SessionManager');

const defaultRedirectUri = 'http://localhost:3000/logged-in';


interface Events
{
    'logged-in' : ()=>void,
    'logged-out' : ()=>void,
    'updated' : ()=>void
}

export default class SessionManager extends TypedEmitter<Events>
{
    api:ApiConnection;

    userInfo?: UserInfo;

    setupHttpsClient:()=>void;
    handleException:(e:any)=>void;

    constructor(api:ApiConnection, setupHttpsClient:()=>void, handleException:(e:any)=>void)
    {
        super();

        this.setMaxListeners(Number.MAX_SAFE_INTEGER);

        this.api = api;
        this.setupHttpsClient = setupHttpsClient
        this.handleException = handleException;
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
                    try
                    {
                        this.userInfo = await this.api.tokenProvider.getUser();
                    }
                    catch (e)
                    {
                        this.userInfo = { id: sub, username: decoded.username };
                    }
                }
                else
                {
                    this.userInfo = { id: sub, username: decoded.client_username };
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
    
    async logout()
    {
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