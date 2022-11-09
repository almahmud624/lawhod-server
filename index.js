const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;
app.use(cors());

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    console.log("database connected");
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
