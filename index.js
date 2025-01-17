const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.eilfw7v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Define collections
    const coffeeCollection = client.db('coffee').collection('coffee');

    //get all value 
    app.get('/coffee',async(req,res)=>{
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Define routes
    app.post('/coffee', async (req, res) => {
      try {
        const newCoffee = req.body;
        console.log(newCoffee);
        const result = await coffeeCollection.insertOne(newCoffee);
        res.send(result);
      } catch (error) {
        console.error('Error inserting coffee:', error);
        res.status(500).send({ error: 'Failed to insert coffee' });
      }
    });

    app.put('/coffee/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert : true};
      const updatedCoffee = req.body;
      const coffee = {
        $set : {
          name :updatedCoffee.name,
          price :updatedCoffee.price,
          test:updatedCoffee.test
        }
      }

      const result = await coffeeCollection.updateOne(filter,coffee,options);
      res.send(result);
    })

    app.delete('/coffee/:id',async (req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result =  await coffeeCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/coffee/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    })
    app.get('/', (req, res) => {
      res.send('Coffee making server is running');
    });

    console.log('Connected to MongoDB and routes are ready!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Run the server
run();

app.listen(port, () => {
  console.log(`Coffee Server is running on port: ${port}`);
});
