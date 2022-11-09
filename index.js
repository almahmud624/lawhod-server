const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const practiceCollection = client.db("law-hod").collection("practiceAreas");
    const reviewCollection = client.db("law-hod").collection("reviews");

    // send practice area on server
    app.post("/practice-areas", async (req, res) => {
      const practiceAreas = req.body;
      const result = await practiceCollection.insertOne(practiceAreas);
      res.send(practiceAreas);
    });

    // get practice areas data from server
    app.get("/practice-areas", async (req, res) => {
      const size = parseInt(req.query.size);
      let sorted;
      if (size === 3) {
        sorted = { _id: -1 };
      } else {
        sorted = { _id: 0 };
      }
      const practiceAreas = await practiceCollection
        .find({})
        .limit(size)
        .sort(sorted)
        .toArray();
      res.send(practiceAreas);
    });

    // get single practice area from server
    app.get("/practice-areas/:id", async (req, res) => {
      const practiceId = req.params.id;
      const result = await practiceCollection.findOne({
        _id: ObjectId(practiceId),
      });
      res.send(result);
    });

    // send review on server
    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      const result = await reviewCollection.insertOne(reviews);
      res.send(reviews);
    });

    // get review data from server
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          "reviewersInfo.email": req.query.email,
        };
      }
      res.send(await reviewCollection.find(query).toArray());
    });

    // delete remove
    app.delete("/reviews/:id", async (req, res) => {
      const result = await reviewCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });

    // update review
    app.put("/reviews/:id", async (req, res) => {
      const { reviewText, rating } = req.body;
      if (!reviewText && !rating) {
        return;
      }
      const updateReview = {
        $set: {
          reviewText,
          rating,
        },
      };
      const result = await reviewCollection.updateOne(
        { _id: ObjectId(req.params.id) },
        updateReview,
        true
      );
      res.send(result);
    });
  } finally {
    // client.close()
  }
}

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("LawHod Running");
});

app.listen(port, () => {
  console.log(`LawHod running on port`, port);
});
