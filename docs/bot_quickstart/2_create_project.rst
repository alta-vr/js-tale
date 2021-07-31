Create Project
==============

Open your IDE terminal, or cmd in the folder in which you wish to create the project.

Creation
--------
Then run the following commands:

* `npm init` - Name your project, and carry out any further customization
* `npm i js-tale`
* `tsc --init`

Setting up scripts
------------------
In `package.json`, in the `scripts` section, add `"start": "ts-node ."`.

Configuring up typescript
-------------------------
In `tsconfig.json`, set `target` to `es6`, and add `resolveJsonModule` as `true`.