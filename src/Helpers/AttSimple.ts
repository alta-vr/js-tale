import Logger from '../logger';
import { Config, Group, Server, ServerConnection } from "..";
import { AttCore } from '.';

const logger = new Logger('Main');

export interface AttSimpleConfig extends Config
{
    groupId : number;
}

export default class AttSimple extends AttCore
{
    group?:Group;
    server?:Server;
    connection?:ServerConnection;

    private config:AttSimpleConfig;
    private onConnect:(connection:ServerConnection)=>void;

    constructor(config:AttSimpleConfig, onConnect:(connection:ServerConnection) => void, autoInit:boolean = true)
    {
        super();

        this.config = config;
        this.onConnect = onConnect;

        if (autoInit)
        {
            this.init()
            .catch(e => logger.error("Error initializing AttBasic"));
        }
    }

    async init()
    {
        await super.init(this.config);

        if (!this.config.groupId)
        {
            logger.error("Must provide a groupId in config for AttSimple to work");
            return;
        }

        this.group = await this.groupManager.groups.get(this.config.groupId);

        if (this.group.servers.items.length != 1)
        {
            throw new Error("AttBasic only supports single server groups");
        }

        this.server = this.group.servers.items[0];

        this.group.automaticConsole(this.connectionOpened.bind(this));
    }   

    private connectionOpened(connection:ServerConnection)
    {
        logger.success(`Connected to ${connection.server.info.name}`);

        connection.on('closed', this.connectionClosed);

        this.connection = connection;

        this.onConnect(connection);
    }

    private connectionClosed(connection:ServerConnection)
    {
        logger.warn(`Disconnected from ${connection.server.info.name}`);

        this.connection = undefined;
    }
}
