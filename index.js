const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://api_connection:I7ThSCgOw5UFg2IA@cluster0.9bycbcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("userCollections").collection("user");

    app.get("/api/add-user", async (req, res) => {
      try {
        const userData = await userCollection.find().toArray();
        console.log(userData);
        res.send(userData);
      } catch (e) {
        res.send("Error" + $e);
      }
    });

    app.post("/api/add-user", async (req, res) => {
      console.log("POST request received at /api/add-user");
      console.log("Request body:", req.body);
      const body = req.body;
      const result = await userCollection.insertOne(body);
      res.send(result);
    });

    app.patch("/api/add-user", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      console.log(filter);
      const updateDoc = {
        $set: {
          name: user.name,
          password: user.password,
          phone: user.phone,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.post("/api/login", async (req, res) => {
      const { email, password } = req.body;

      try {
        const user = await userCollection.findOne({ email, password });

        if (user) {
          res.send({ message: "Login Success", user: user });
        } else {
          res.status(401).send({ message: "Invalid email or password" });
        }
      } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);
