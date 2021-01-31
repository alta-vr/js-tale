
const config = require('./config');

import { ApiConnection } from './Core/ApiConnection';
import { SubscriptionManager } from './Core/SubscriptionManager';
import { GroupManager } from './Groups/GroupManager';
import { Group } from './Groups/Group';

import Discord, { TextChannel } from 'discord.js';

import Logger, { initLogger } from './logger';
import { Server } from './Groups/Server';
import { Console } from './Groups/Console';

initLogger();

const logger = new Logger('Main');

class Main
{
    api:ApiConnection = new ApiConnection();
    subscriptions:SubscriptionManager = new SubscriptionManager(this.api);
    groupManager:GroupManager = new GroupManager(this.subscriptions);
    discord:Discord.Client = new Discord.Client();

    async init()
    {
        await new Promise<void>(resolve =>
        {
            this.discord.on('ready', resolve);
            this.discord.login(config.discord);
        });

        this.discord.on('message', async message =>
        {
            try
            {
                if (!!message.guild && message.content.startsWith('#'))
                {
                    var guildConfig = config.guilds && config.guilds[message.guild.id];

                    if (!!guildConfig)
                    {
                        var groups = guildConfig.groups;

                        var command = message.content.substring(1).toLowerCase().split(/ +/);

                        if (command.length == 2)
                        {
                            var group:Group = this.groupManager.groups.get(groups[0]);

                            switch (command[0])
                            {
                                case 'accept':
                                    var request = group.requests.find(command[1]);

                                    if (!request)
                                    {
                                        message.channel.send("Join request not found");
                                    }
                                    else
                                    {
                                        var cache = request;

                                        cache.accept()
                                        .then(() => message.channel.send(`Accepted ${cache.username}`))
                                        .catch(e => message.channel.send(e.name));
                                    }
                                    break;

                                case 'reject':
                                        var request = group.requests.find(command[1]);

                                        if (!request)
                                        {
                                            message.channel.send("Join request not found");
                                        }
                                        else
                                        {
                                            var cache = request;
    
                                            cache.reject()
                                            .then(() => message.channel.send(`Rejected ${cache.username}`))
                                            .catch(e => message.channel.send(e.name));
                                        }
                                    break;

                                case 'uninvite':                                    
                                    
                                        var invite = group.invites.find(command[1]);

                                        if (!invite)
                                        {
                                            message.channel.send("Invite not found");
                                        }
                                        else
                                        {
                                            var inviteCache = invite;
    
                                            inviteCache.revoke()
                                            .then(() => message.channel.send(`Uninvited ${inviteCache.username}`))
                                            .catch(e => message.channel.send(e.name));
                                        }
                                    break;

                                case 'invite':
                                    this.api.resolveUsernameOrId(command[1])
                                    .then(id => group.invite(id))
                                    .then(() => message.channel.send(`Invited ${command[1]}`))
                                    .catch(e => message.channel.send(e.name));
                                    break;

                                default:
                                    message.channel.send('unknown command');
                            }
                        }
                    }
                }
            }
            catch (e)
            {
                message.channel.send(JSON.stringify(e));
            }
        });

        await this.api.login(config);
        
        await this.subscriptions.init();

        await this.groupManager.groups.refresh(true);

        await this.groupManager.acceptAllInvites(true);

        await this.groupManager.automaticConsole(this.handleConnection.bind(this));
    }

    private handleConnection(connection:Console)
    {
        logger.success(`Connected to ${connection.server.data.name}`);
    }
}

var main = new Main();
main.init();