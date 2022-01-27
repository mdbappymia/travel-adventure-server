const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iuevi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    console.log("database connected");
    // set database and collection
    const database = client.db("travel-adventures");
    const placeCollection = database.collection("places");
    const userCollection = database.collection("users");
    const bookingCollection = database.collection("bookings");
    const reviewCollection = database.collection("reviews");

    // post a single place to database
    app.post("/places", async (req, res) => {
      const place = req.body;
      const result = await placeCollection.insertOne(place);
      res.json(result);
    });
    // get all places from database
    app.get("/allPlaces", async (req, res) => {
      const result = await placeCollection.find({}).toArray();
      res.json(result);
    });
    // get 10 place from database
    app.get("/places/:page", async (req, res) => {
      const page = req.params.page;
      const cursor = placeCollection.find({});
      const count = await cursor.count();
      let places;
      if (page) {
        places = await cursor
          .skip(page * 10)
          .limit(10)
          .toArray();
      } else {
        places = await cursor.limit(10).toArray();
      }

      res.send({
        count,
        places,
      });
    });

    // get a single place from database
    app.get("/place/:id", async (req, res) => {
      const id = req.params.id;
      const result = await placeCollection.findOne({ _id: ObjectId(id) });
      res.json(result);
    });

    // post a single user to database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const checkUser = await userCollection.findOne({ user_id: user.user_id });
      if (checkUser) {
        res.json({ message: "user already exist" });
        return;
      }
      const result = await userCollection.insertOne(user);
      res.json(result);
    });
    // get all user
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.json(result);
    });

    // user management is it admin or user
    app.put("/users/:id", async (req, res) => {
      const userId = req.params.id;
      const role = req.body;
      const setRol = role.role;
      const query = { _id: ObjectId(userId) };
      const options = { upsert: true };
      const updateRole = {
        $set: {
          role: setRol,
        },
      };
      const result = await userCollection.updateOne(query, updateRole, options);
      res.json(result);
    });
    // get user for specific user_id
    app.get("/users/:user_id", async (req, res) => {
      const id = req.params.user_id;
      const result = await userCollection.findOne({ user_id: id });
      res.json(result);
    });
    // post a single booked place
    app.post("/booking", async (req, res) => {
      const data = req.body;
      const result = await bookingCollection.insertOne(data);
      res.json(result);
    });

    // get all booking place
    app.get("/booking", async (req, res) => {
      const result = await bookingCollection.find({}).toArray();
      res.json(result);
    });
    // delete a single booking
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await bookingCollection.deleteOne({ _id: ObjectId(id) });
      res.json(result);
    });
    // update approved booking
    app.put("/approve/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await bookingCollection.updateOne(query, updateDoc);
      res.json(result);
    });
    // get booking data for specific user
    app.get("/userBooking/:userId", async (req, res) => {
      const userId = req.params.userId;
      const result = await bookingCollection
        .find({ user_id: userId })
        .toArray();
      res.json(result);
    });

    // insert a single review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // get all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello node server");
});
app.listen(port, () => {
  console.log("Server is running on port", port);
});
