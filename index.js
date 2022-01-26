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
    // get all place from database
    app.get("/places/:page", async (req, res) => {
      const page = req.params.page;
      const cursor = placeCollection.find({});
      const count = await cursor.count();
      let places;
      if (page) {
        places = await cursor
          .skip(page * 9)
          .limit(9)
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

    // post a single booked place
    app.post("/booking", async (req, res) => {
      const data = req.body;
      const result = await bookingCollection.insertOne(data);
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
