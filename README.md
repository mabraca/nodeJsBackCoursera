### Run

just type in console: 

``` npm start ```


### Run Mongo DB

* 1. Install mondoDB.
* 2. Create a folder call it whatever you want. Ex. *mongodb* . Inside that folder create another folder and call it *data*.
* 3. mongod --dbpath=data --bind_ip 127.0.0.1
* 4. mongo


The Mongo REPL shell will start running and give you a prompt to issue commands to the MongoDB server. At the Mongo REPL prompt, type the following commands one by one and see the resulting behavior:

```
    db
    use conFusion
    db
    db.help()
```


You will now create a collection named dishes, and insert a new dish document in the collection:


``` db.dishes.insert({ name: "Uthappizza", description: "Test" }); ```


Type "exit" at the REPL prompt to exit the Mongo REPL. 