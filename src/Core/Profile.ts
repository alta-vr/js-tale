import ApiConnection from "./ApiConnection";
import Logger from "../logger";

const logger = new Logger("Alta Profile");

export default class Profile
{
    api:ApiConnection;

    constructor(api:ApiConnection)
    {
        this.api = api;
    }

    refresh() : Promise<void>
    {
        logger.warn("Refresh not yet implemented");

        return Promise.resolve();
    }

    getLoggedIn()
    {
        return !!this.api.tokenProvider.token;
    }

    getId()
    {
        return this.api.sessionManager.userInfo?.id;
    }

    getUsername()
    {
        return this.api.sessionManager.userInfo?.username;
    }

    getVerified() : boolean
    {
        return this.api.tokenProvider.token?.decoded.is_verified || false;
    }

    getSupporter()
    {
        //TODO: Add supporter to profile
        return undefined;
    }
}