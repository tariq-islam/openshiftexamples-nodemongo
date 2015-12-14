# Node.js and MongoDB example
This example simply opens a conection to a mongoDB and then creates a websever with a few routes to test that the database connection worked.  Note that each time it starts it will add items to 2 collections in the database.  You can test with the following routes:
* "[YOURHOST]/" = Hello page
* "[YOURHOST]/test1" = data in collection 1
* "[YOURHOST]/test2" = data in colleciton 2
* "[YOURHOST]/test3" = valid route but to a non-existent collection call on the DB


A good reference for playing around with OpenShift and extending this code can be found by following [this link][1]

[1]: http://training.runcloudrun.com/roadshow/07-databases.md.html
