.. _LiveList:

LiveList
===================

A list that utilizes both Web API calls, and WebAPI subscriptions in order to remain up to date.

LiveLists by default are inactive, to avoid requesting and subscribing to data unecessarily. It is recommended to be thoughtful in choosing which lists you require activating.

``refresh(subscribe: boolean = false) : Promise<T[]>``
    Refreshes a list, and returns its contents. Optionally subscribes to automatically add/remove items over time.