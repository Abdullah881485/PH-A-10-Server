const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.awdvvgg.mongodb.net/?appName=Cluster0`;

// middleware
app.use(cors())
app.use(express.json())


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get("/", (req, res) => {
    res.send('FinEase is running')
})

async function run() {
    try {
        await client.connect();

        const db = client.db("FinEase_db")
        const transactionsCollection = db.collection('transaction')

        app.post("/myTransaction", async (req, res) => {
            const newTransaction = req.body;
            const result = await transactionsCollection.insertOne(newTransaction)
            res.send(result)
        })
        app.get("/myTransaction", async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email
            }
            const cursor = transactionsCollection.find(query).sort({ date: -1, amount: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/transactionDetails/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await transactionsCollection.findOne(query)
            res.send(result)
        })
        app.get("/myTransaction/:category", async (req, res) => {
            const email = req.query.email;
            const category = req.params.category
            const query = { category }
            if (email) {
                query.email = email
            }
            const result = await transactionsCollection.find(query).toArray()
            res.send(result)
        })
        app.patch("/updateTransaction/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const updatedTransaction = req.body
            const update = {
                $set: updatedTransaction
            }
            const result = await transactionsCollection.updateOne(query, update)
            res.send(result)
        })
        


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.listen(port, () => {
    console.log(`FinEase server running on ${port}`);

})