.. _Client:

Client
======

Client is a convenience class existing to provide a central entrypoint for a common bot design. It is possible to extend this class, or to not use it altogether.

``api : ApiConnection``
    The internal api connection, for authorization and Web Api access.

``subscriptions : SubscriptionManager``
    The subscription manager, for subscriptions to Web Api events.

``groupManager : GroupManager``
    The group manager, an access point for interacting with groups.