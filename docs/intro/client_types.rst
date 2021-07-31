Client Types
============

Alta supports two different types of clients, Single Sign On (SSO) and Bot. It is important to create the correct type of client depending on your needs.

Single Sign On (SSO)
--------------------

A Single Sign On client will allow you to add a "Log in with Alta" feature to your website. This can allow you to identify exactly who a user is, without the requirement of creating your own login system.

When a user signs in with Alta, they will be asked to grant your application permission to access various "scopes", including what information you can access, and what actions you can do on their behalf.

A Township Tale's feedback forum is an SSO client, allowing users to log in with Alta, before posting in the forum.

Bot
----

Bot clients are clients that have a "fake account" associated with them. They can be invited to groups, added as friends, accept join requests, send commands to servers, and much more.

The most common use case of a bot client is to provide a long running service for a server. This is usually used in conjunction with other services, such as databases, discord clients, or website frontends.

Some example use cases of bots include:

* Allowing for commands to be sent via discord
* Showing maps of player locations
* Restricting chunks in which players can enter
* Automating map cleanup / wipe routines
* "Modding" gameplay, by providing new ways to spend or gain items