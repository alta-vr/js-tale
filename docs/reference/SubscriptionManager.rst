.. _SubscriptionManager:

SubscriptionManager
===================

The subscription manager handles subscriptions to Web API events.

``subscribe(event: string, sub: any, callback: (data: any) => void) : Promise<void>``
    Calls a callback whenever a particular event with a given subject is fired

``unsubscribe(event: string, sub: any, callback: (data: any) => void) : Promise<void>``
    Removes the callback for the given event / subject