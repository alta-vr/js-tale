/// <reference types="node" />
import { AccessToken, ModuleOptions } from 'simple-oauth2';
import http from 'http';
import Config from './Config';
import { TypedEmitter } from 'tiny-typed-emitter';
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
interface Events {
    'logged-in': () => void;
    'logged-out': () => void;
    'updated': () => void;
}
export default class ApiConnection extends TypedEmitter<Events> {
    config?: Config;
    clientConfig?: ModuleOptions<"client_id">;
    httpsAgent?: http.Agent;
    headers: any;
    accessToken?: AccessToken;
    decodedToken?: any;
    userId?: number;
    endpoint?: string;
    canRefresh: boolean;
    refresh?: Promise<void>;
    initOffline(config: Config): Promise<void>;
    private init;
    login(config: Config): Promise<void>;
    loginResourceOwner(username: string, password: string, isHashed?: boolean): Promise<void>;
    private handleException;
    hashPassword(password: string): string;
    loadResourceOwner(config: Config, accessToken: object): Promise<void>;
    private setupHttpsClient;
    private checkRefresh;
    forceRefresh(): Promise<void>;
    private refreshInternal;
    fetch(method: HttpMethod, path: string, body?: any | undefined): Promise<any>;
    resolveUsernameOrId(value: string | number): Promise<any>;
    logout(): Promise<void>;
}
export {};
