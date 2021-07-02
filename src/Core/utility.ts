import nodeFetch from 'node-fetch';

export function epoch() 
{
    return Math.round(new Date().getTime()/1000.0)
}


export const fetch = ('window' in global) ? nodeFetch.bind(global.window) : nodeFetch;