Testing
========

The final step in this quickstart is to test the bot!
Some steps in this process will include some common issues and solutions.

Start the bot
-------------

Firstly, run ``npm start``.

.. error:: Having issues? Make sure you set up the 'start' script in package.json correctly! See the Create Project step.

Invite the bot
--------------

One of the features of this template bot, is automatically accepting invites. If you invite the bot to your group (eg. via it's username in the Alta Launcher), the bot should immediately log to the console, and accept the invite.

.. note:: You will need to refresh the list in the launcher to see the bot move from the "invites" to "members" list.

Promote the bot
---------------

In order for the bot to connect to the game server for console commands or subscriptions, it must be promoted. In the launcher, you can do this by clicking on the bot in the members list, then "Promote to Admin".

Start the server
----------------

If the server is not already online, you can boot it up by joining it in game. This should trigger an automatic connection by the bot.

You should see a log in the console saying ``Connected to <your server name>``.

.. error:: If your bot does not automatically connect, double check it has been invited and promoted in the correct.