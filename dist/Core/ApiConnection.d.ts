/// <reference types="node" />
import http from 'http';
import { Config } from './Config';
export declare type HttpMethod = 'POST' | 'DELETE' | 'GET' | 'PUT' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
export declare class HttpError {
    method: HttpMethod;
    path: string;
    code: number;
    message: string;
    constructor(method: HttpMethod, path: string, code: number, message: string);
}
export interface UserInfo {
    id: number;
    username: string;
}
export declare class ApiConnection {
    httpsAgent: http.Agent | undefined;
    headers: any;
    accessToken: string | undefined;
    userId: number | undefined;
    endpoint: string | undefined;
    login(config: Config): Promise<void>;
    fetch(method: HttpMethod, path: string, body?: any | undefined): Promise<any>;
    resolveUsernameOrId(value: string | number): Promise<any>;
}
