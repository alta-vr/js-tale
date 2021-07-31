Bot Template
============

This step has two sections: firstly the code, and secondly a breakdown of what is occuring.

The Code
--------

Create a file called ``index.ts``. Add the following code to it::


    import { Client, ServerConnection } from 'js-tale/dist';
    import Logger, { initLogger } from 'js-tale/dist/logger';

    import config from './config.json';

    initLogger();

    const logger = new Logger('Main');

    class Main
    {
        client:Client = new Client(config);

        async initialize()
        {
            await this.client.initialize();
            
            await this.client.groupManager.groups.refresh(true);

            await this.client.groupManager.acceptAllInvites(true);

            this.client.groupManager.automaticConsole(this.connectionOpened.bind(this));
        }

        private connectionOpened(connection:ServerConnection)
        {
            logger.success(`Connected to ${connection.server.info.name}`);

            connection.on('closed', this.connectionClosed);
        }

        private connectionClosed(connection:ServerConnection)
        {
            logger.warn(`Disconnected from ${connection.server.info.name}`);
        }
    }

    var main = new Main();
    main.initialize();

Explaination
------------
This code creates a new js-tale client, providing the configuration defined in ``config.json``. ::

    client:Client = new Client(config);

This client is initialized, and then loads a list of all groups it is in. By passing ``true`` to ``refresh`` it not only gets the list, but subscribes to future modifications (ie. joining or leaving a group). ::

    await this.client.initialize();

    await this.client.groupManager.groups.refresh(true);

The bot then makes use of a convenience function ``acceptAllInvites`` to accept every invite it has received. Like ``refresh``, this function has the option to subscribe to future modifications; by passing ``true``, the bot will accept any invite it receives throughout the session, not just on bootup. ::

    await this.client.groupManager.acceptAllInvites(true);

Finally, the bot uses another convience function ``automaticConsole`` which internally subscribes to servers going up, to immediately create a console connection, and fire a callback.

In this case, ``connectionOpened`` will be called whenever a server comes online. ::

    this.client.groupManager.automaticConsole(this.connectionOpened.bind(this));

Whenever a connection is opened, the bot logs that it has connected to a server. This would be a prime location to send commands to the server or subscribe to server events.

The bot then subscribes to the connection being destroyed. ::

    logger.success(`Connected to ${connection.server.info.name}`);

    connection.on('closed', this.connectionClosed);

And lastly, when a connection is destroyed, the bot logs a warning to say so. ::

    logger.warn(`Disconnected from ${connection.server.info.name}`);

More information about these clases and functions, as well as many others, can be in the following section.