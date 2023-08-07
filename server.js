const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
require("dotenv").config();

const server = express();
var PORT = process.env.PORT || 5000;
var IP = process.env.IP || "127.0.0.1";
const uri = process.env.DBURI;

// DB CLIENT
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client.connect();
const database = client.db("testDB");
const collection = database.collection("testColl");

server.use(express.static("public"));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

server.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "login.html"));
});

server.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "register.html"));
});

server.post("/register", (req, res) => {
  let username = req.body.usrname;
  let plain_pwd = req.body.pwd;

  bcrypt.hash(plain_pwd, 5).then((hash, err) => {
    collection.insertOne({ user: username, pwd: hash });
    console.log(`USERNAME: ${username}\nHASHED PW: ${hash}`);
  });

  res.send("Data Received: " + JSON.stringify(req.body));
});

server.post("/login", async (req, res) => {
  let username = req.body.usrname;
  let plain_pwd = req.body.pwd;

  let user = await findUserInDB(username);
  if (user) {
    bcrypt.compare(plain_pwd, user.pwd, (err, result) => {
      if (result) {
        res.json({ login: "SUCCESS" });
      } else {
        res.json({ login: "Failed, invalid user / password combination 2" });
      }
    });
  } else {
    res.json({ login: "Failed, invalid user / password combination 2" });
  }
});

server.listen(PORT, IP, (req, res) => {
  console.log(`[SERVER IS RUNNING] AT: ${IP}:${PORT}`);
});

// function for finding user in the mongoDB
const findUserInDB = async (user) => {
  return (await collection.findOne({ user: user }))
    ? collection.findOne({ user: user })
    : false;
};
