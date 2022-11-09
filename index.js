const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    const reviewCollection = client.db("law-hod").collection("reviews");
    // send review on server
    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      const result = await reviewCollection.insertOne(reviews);
      res.send(reviews);
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
