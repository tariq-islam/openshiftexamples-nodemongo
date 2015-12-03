# Node.js and MongoDB example
This example simply opens a conection to a mongoDB and then creates a websever with a few routes to test that the database connection worked.  Note that each time it starts it will add items to 2 collections in the database.  You can test with the following routes:
> "[HOST]/" = Hello page
> "[HOST]/test1" = data in collection 1
> "[HOST]/test2" = data in colleciton 2
> "[HOST]/test3" = valid route but to a non-existent collection call on the DB
