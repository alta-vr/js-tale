Config File
===========

Create a file in the root of the folder named `config.json`.

.. warning:: It is important that you add this file to your .gitignore if this is to be uploaded to a git repository. Your client secret should not ever be shared.

The file should contain::

    {
        "clientId": "<insert id here>",
        "scope" : "<insert scopes here>"
        "redirectUrl" : "<insert redirect uri here>"
    }

You will have received a list of allowed scopes along with your Client ID and Client Secret. 

These should be inserted in a space separated form, such as::

    openid profile