const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
// require jwt
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

// JWT verify function
const verifyJWT = (req, res, next) => {
  const jwtHead = req.headers.authorization;

  if (!jwtHead) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = jwtHead.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send("Forbidden Access");
    }
    req.decoded = decoded; // decode the code
    next();
  });
};

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

    // jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

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
        sorted = {};
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
      if (req.query.practiceId) {
        query = {
          practiceId: req.query.practiceId,
        };
      }
      res.send(await reviewCollection.find(query).toArray());
    });

    // get reviews by practices email
    app.get("/reviews/:email", verifyJWT, async (req, res) => {
      // valid email check for JWT
      const decode = req.decoded;
      if (decode?.email !== req.params?.email) {
        return res.status(403).send("Access Forbiden");
      }
      const email = req.params.email;
      const query = {
        "reviewersInfo.email": email,
      };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
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
