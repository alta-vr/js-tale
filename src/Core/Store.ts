import { ApiConnection } from "..";

export default class Store
{
    api:ApiConnection;
    store: Storage;

    constructor(api:ApiConnection, store:Storage)
    {
        this.api = api;
        this.store = store;
    }

    get(key:string)
    {
        return this.store.getItem(`js-tale:${this.api.config.clientId}:${key}`);
    }

    set(key:string, value:string)
    {
        return this.store.setItem(`js-tale:${this.api.config.clientId}:${key}`, value);
    }

    clear()
    {
        var keys = [];

        var prefix = `js-tale:${this.api.config.clientId}`;

        for (let index = 0; index < this.store.length; index++) 
        {
            let key = this.store.key(index);

            if (!!key && key.startsWith(prefix)) 
            {
                keys.push(key);
            }
        }

        for (var item of keys)
        {
            this.store.removeItem(item);
        }
    }
}