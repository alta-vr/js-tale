Overview
========

.. warning:: This section is not complete. 

This section will cover steps to get users logging into your website with Alta.

It is expected at this point that you have:
* A pre-existing website, accessible via https
* A Client ID, created with a Redirect URL pointing to your website

If you have not got a Client ID, contact Joel_Alta with a desired client name, as well as a desired redirect URL (eg. https://yourwebsite.com/login_redirect). You will be able to proceed with many of these steps, but users will not be able to login until you have configured the client with a Client ID.

This will involve the following steps:

1) Installing global dependencies
2) Installing js-tale in project
3) Setting up a config file
4) Adding a "Login with Alta" button
5) Showing some user details if logged in

It is advised that you read through each of these steps thoroughly, to ensure you don't run into any issues.