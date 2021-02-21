import { Config, Group, Server, ServerConnection } from "..";
import { AttCore } from '.';
export interface AttSimpleConfig extends Config {
    groupId: number;
}
export default class AttSimple extends AttCore {
    group?: Group;
    server?: Server;
    connection?: ServerConnection;
    private config;
    private onConnect;
    constructor(config: AttSimpleConfig, onConnect: (connection: ServerConnection) => void, autoInit?: boolean);
    init(): Promise<void>;
    private connectionOpened;
    private connectionClosed;
}
