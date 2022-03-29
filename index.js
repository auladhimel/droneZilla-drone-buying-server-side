const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ufni7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);


async function run() {
    try {
        await client.connect();
        // collections 
        const database = client.db('drone-zilla');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const productsCollection = database.collection('products');
        const reviewsCollection = database.collection('reviews');
        const galleryCollection = database.collection("gallery");



        // API for Customer Review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            console.log(review);
            console.log(result);
            res.json(result)

        })

        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


        // API for Products
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            console.log(product);
            console.log(result);
            res.json(result)

        })
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })


        // API for Orders
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            console.log(query);
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result)
            console.log(result);
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('deleting', id);
            res.json(result)

        })
//  New
        // app.post('/purchase/:id', async (req, res) => {
        //     const order= req.body;
        //     const result= await ordersCollection.insertOne(order);
        //     res.json(result)
        // })

        app.get("/singlePurchase/:id", (req, res) => {
            console.log(req.params.id);
             productsCollection.findOne({ _id: ObjectId(req.params.id) })
            .then((result)=>{
             res.send(result)
            })
        })

        // API for Users
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            console.log(user);
            res.json({ admin: isAdmin });

        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result)

        })
        // API for creating user as admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log(result);
            res.json(result)

        })

        // API for Manage Orders as admin
        app.get('/allOrders', async (req,res)=>{
            const cursor= ordersCollection.find({});
            const orders= await cursor.toArray();
            console.log(orders);
            res.send(orders);
        })

        // Update Status

        app.put('/updateStatus/:id', async(req,res)=>{
            const id=req.params.id;
            const updatedStatus=req.body.status;
            const filter={_id:ObjectId(id)};
            console.log(updatedStatus);
            ordersCollection.updateOne(filter, {
                $set:{status:updatedStatus},
            })
            .then((result)=>{
                res.send(result);
            });
        });
        
        // SIngle Product Update API

        // Get single Product for updating
        app.get("/singleProduct/:id", (req,res)=>{
            console.log(req.params.id);
            productsCollection.findOne({_id:ObjectId(req.params.id)})
            .then((result)=>{
                console.log(result);
                res.send(result);

            });
        })

        app.put("/update/:id", async(req,res)=>{
            const id= req.params.id;
            const updatedName=req.body;
            const filter={_id: ObjectId(id)};
            productsCollection.updateOne(filter,{
                $set:{
                    productName:updatedName.productName,
                    price:updatedName.price,
                    description:updatedName.description,
                    
                },
                })
                .then(result=>{
                    res.send(result);
                });
        })

        // API for manage products delete 

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            console.log('deleting', id);
            res.json(result)

        })

        // API for gallery 
        // get 
        app.get('/gallery', async (req, res) => {
            const cursor = galleryCollection.find({})
            const gallery = await cursor.toArray()
            res.send(gallery)
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);
// Testing API
app.get('/', (req, res) => {
    res.send('Hello DroneZilla! Are you there?')
})

app.listen(port, () => {
    console.log(`listening ${port}`)
})