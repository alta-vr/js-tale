import { ApiConnection } from "..";

export default class Store
{
    clientId:string;
    store: Storage;

    constructor(clientId:string, store:Storage)
    {
        this.clientId = clientId;
        this.store = store;
    }

    get(key:string)
    {
        return this.store.getItem(`js-tale:${this.clientId}:${key}`);
    }

    set(key:string, value:string)
    {
        return this.store.setItem(`js-tale:${this.clientId}:${key}`, value);
    }

    clear()
    {
        var keys = [];

        var prefix = `js-tale:${this.clientId}`;

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