Welcome to js-tale!
===================================

js-tale is the official `Node.js <https://nodejs.org/>`_ library for interacting with Alta and `A Township Tale <https://townshiptale.com>`_ APIs and servers.

.. note:: Usage of this library requires experience with Node.js. Although this documentation will walk you through the steps to getting things up and running, you will need to be comfortable with programming and debugging in order to make use of the library.

The library currently covers the two major types of 3rd party applications supported by Alta.
These are:

| **Login with Alta**
| Leveraging Alta's SSO (Single Sign On) support, to allow users to log into your website in a secure fashion.

| **Creating a Bot**
| Providing functionality for a 'Bot User', from managing groups, to interacting with servers.

.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: Introduction:

   intro/big_picture
   intro/client_types
   intro/getting_help

.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: SSO Quickstart:

   sso_quickstart/0_overview
   sso_quickstart/1_dependencies
   sso_quickstart/2_installing_js_tale
   sso_quickstart/3_config_file
   sso_quickstart/4_login_button
   sso_quickstart/5_user_details
   sso_quickstart/6_next_steps

.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: Bot Quickstart:

   bot_quickstart/0_overview
   bot_quickstart/1_dependencies
   bot_quickstart/2_create_project
   bot_quickstart/3_config_file
   bot_quickstart/4_bot_template
   bot_quickstart/5_testing
   bot_quickstart/6_next_steps


.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: Reference

   reference/Client
   reference/ApiConnection
   reference/TokenProvider
   reference/SessionManager
   reference/SubscriptionManager
   reference/LiveList
   reference/GroupManager
   reference/Group
   
.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: Reference

   server_connection_guide/overview