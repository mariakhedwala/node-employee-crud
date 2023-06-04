const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookie_parser = require("cookie-parser");

const empRoutes = require("./routes/employees-routes");

const app = express();

app.get("/", (req, res) => {
  res.send("hello");
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  next();
});

app.use("/api/employees", empRoutes);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aduoemu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  ) //returns a promise as it is an async task
  .then(() => {
    app.listen(8000);
  })
  .catch((err) => {
    console.log(err);
  });
