.. _ApiConnection:

ApiConnection
=============

ApiConnection internally creates a TokenProvider to handle authorization, as well as an https agent through which it communicates with the Web API.

.. note::Although used extensively internally, you should not need to interact directly with this class, unless you are writing an SSO client, which requires access to the tokenProvider and sessionManager.

``config : Config``
    The config provided upon setup.

``tokenProvider : TokenProvider``
    Provides authorization tokens to be sent when accessing the WebAPI.

``sessionManager : SessionManager``
    Handles the current login session. Although this isn't a core part of a bot client, this is vital for SSO clients.

``initialize() : Promise<void>``
    Initializes the connection, logging in as a Bot client, or checking for existing login in the case of an SSO client.

``fetch(method: HttpMethod, path: string, body: any | undefined = undefined) : Promise<any>``
    Sends a request to the Web API. At this stage it is advised that you do not call this method directly, and there is no documentation of these endpoints.

``resolveUsernameOrId(value: string|number) : Promise<number>``
    Returns a userid of a given user, when provided with either their username or userid
