Config File
===========

Create a file in the root of the folder named `config.json`.

.. warning:: It is important that you add this file to your .gitignore if this is to be uploaded to a git repository. Your client secret should not ever be shared.

The file should contain::

    {
        "clientId": "<insert id here>",
        "clientSecret": "<insert secret here>",
        "scope" : "<insert scopes here>"
    }

You will have received a list of allowed scopes along with your Client ID and Client Secret. 

These should be inserted in a space separated form, such as::

    ws.group ws.group_members ws.group_servers ws.group_bans ws.group_invites group.info group.join group.leave group.view group.members group.invite server.view server.console