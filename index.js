const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const secretKey = "your_secret_key";

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

    // Middleware to verify JWT token
    function authenticateToken(req, res, next) {
      const token = req.headers["authorization"];
      if (!token) return res.status(401).send("Access denied");

      try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
      } catch (error) {
        res.status(403).send("Invalid token");
      }
    }

    app.get("/api/add-user", authenticateToken, async (req, res) => {
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
      const { name, email, password, phone } = req.body;
      
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { name, email, password: hashedPassword, phone };
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).send("Internal server error");
      }
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
        console.log("Login request received. Email:", email, "Password:", password);
    
        const user = await userCollection.findOne({ email }); 
        console.log("User found:", user);
    
        if (user) {
          console.log("Hashed password from DB:", user.password);
          console.log("Password from request body:", password);
          
          if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
            res.send({ message: "Login Success", token: token });
          } else {
            console.log("Password mismatch");
            res.status(401).send({ message: "Invalid email or password" });
          }
        } else {
          console.log("User not found");
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

// http://192.168.0.104:5000/api/add-user
