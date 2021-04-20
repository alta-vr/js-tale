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
        return this.api.decodedToken !== undefined;
    }

    getId()
    {
        return this.api.decodedToken.sub;
    }

    getUsername()
    {
        return this.api.decodedToken.username;
    }

    getVerified()
    {
        return this.api.decodedToken.is_verified;
    }
    
    requestVerificationEmail(email:string)
    {
        if (!this.getVerified())
        {
            logger.info("Requesting verification");
    
            return this.api.fetch("PUT", `users/${this.getId()}/verification`, { email });
        }
    }
}