Project based on Webstrates, can be run in the same way:

Installation
============
Requirements:
 * [MongoDB](http://www.mongodb.org)
 * [NodeJS](http://nodejs.org)
 * [CoffeeScript](http://coffeescript.org)

To install:
 * Clone this repository
 * From the repository root do:
    * npm install
    * cake build
    * mongorestore --db=webstrate --collection=webstrates dump/webstrate/webstrates.bson
    * coffee webstrates.coffee

Alternatively [use Vagrant](utils/vagrant) to create and run a VM configured with Webstrates.


To get all instruments and necessary documents.

To try out an editor and instruments on a browser go to:

http://localhost:7007/editor?mainEditor=1
