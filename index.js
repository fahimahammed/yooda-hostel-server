const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

require('dotenv').config();
const app = express()

const port = process.env.PORT || 3001

app.use(cors());
app.use(bodyParser.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zpqcv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const foodCollection = client.db("hostelYooda").collection("fooditems");
    const studentCollection = client.db("hostelYooda").collection("students");
    const distributiionCollection = client.db("hostelYooda").collection("distribution");


    // get food list 
    app.get('/foodlist', (req, res) => {
        foodCollection.find()
        .toArray((err, data) =>{
            res.send(data);
        })
    })

    // Get food items from DB
    app.get('/food-items', (req, res) => {
        foodCollection.find()
        .toArray((err, data) => {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
    
            const startIndex = (page-1) * limit;
            const endIndex = page * limit;
    
            let results = {}
    
            if(startIndex > 0){
                results.previous = {
                    page : page-1,
                    limit: limit
                }
            }
    
            if(endIndex < data.length){
                results.next = {
                    page : page+1,
                    limit: limit
                }
            }
    
            results.result = data.slice(startIndex, endIndex);
    
            res.send(results); 
        })
    })

    //Post food items in db
    app.post('/add-food', (req, res) => {
        const newItem = req.body;
        foodCollection.insertOne(newItem)
        .then(result => console.log(result.insertedCount))
        res.send(result.insertedCount > 0)
    })

    //delete food item
    app.delete('/delete-item/:id', (req, res) => {
        const id = ObjectId(req.params.id);
        foodCollection.findOneAndDelete({_id: id})
        .then(documents => res.send(!!documents.value));
        
      })

    //Edit item 
    app.patch('/update/:id', (req, res) => {
        foodCollection.updateOne({_id: ObjectId(req.params.id)},
        {
            $set: { name: req.body.name, price: req.body.price }
        })
        .then(result => {
            res.send(result.modifiedCount > 0);
        })
    })

    //add new student
    app.post('/add-student', (req, res) => {
        const newItem = req.body;
        studentCollection.insertOne(newItem)
        .then(result => console.log(result.insertedCount))
        res.send(result.insertedCount > 0)
    })

    //get students 
    app.get('/students', (req, res) => {
        studentCollection.find()
        .toArray((err, data) => {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
    
            const startIndex = (page-1) * limit;
            const endIndex = page * limit;
    
            let results = {}
    
            if(startIndex > 0){
                results.previous = {
                    page : page-1,
                    limit: limit
                }
            }
    
            if(endIndex < data.length){
                results.next = {
                    page : page+1,
                    limit: limit
                }
            }
    
            results.result = data.slice(startIndex, endIndex);
    
            res.send(results); 
        })
    })

    app.patch('/update-student/:id', (req, res) => {
        studentCollection.updateOne({_id: ObjectId(req.params.id)},
        {
            $set: { 
                fullName: req.body.fullName, 
                roll: req.body.roll,
                age: req.body.age,
                class: req.body.class,
                hall: req.body.hall,
                status: req.body.status
             }
        })
        .then(result => {
            res.send(result.modifiedCount > 0);
        })
    })


    // delete student 
    app.delete('/delete-student/:id', (req, res) => {
        const id = ObjectId(req.params.id);
        studentCollection.findOneAndDelete({_id: id})
        .then(documents => res.send(!!documents.value));
        
    })


    // find students 
    app.get('/student/:roll', (req, res) => {
        studentCollection.find({roll: req.params.roll})
        .toArray((err, documents) =>{
            res.send(documents[0]);
        })
    })


    // add distribution
    app.post('/add-distribution', (req, res) => {
        const newItem = req.body;
        distributiionCollection.insertOne(newItem)
        .then(result => console.log(result.insertedCount))
        res.send(result.insertedCount > 0)
    })

    // single data of food serve for validation 
    app.get('/distribution/:date/:id/:shift', (req, res) => {
        distributiionCollection.find({date: req.params.date, studentId: req.params.id, shift: req.params.shift})
        .toArray((err, data) =>{
            res.send(data);
        })
    })

    // update status (bulk action)
    app.patch('/update-status', (req, res) => {
        for(let i=0; i<req.body.length; i++ ) {
            studentCollection.updateOne({_id: ObjectId(req.body.item[i]._id)},
            {
                $set: { 
                    status: req.body.item[i].status
                 }
            })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
            console.log("done");
            sleep(100);
        }

    })
});

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

app.listen(port, ()=>{
    console.log("Server is running...");
});