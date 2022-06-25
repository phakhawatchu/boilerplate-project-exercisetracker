const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

let userSchema = new mongoose.Schema({
    username: String,
});

let exerciseSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: Date,
});

let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", (req, res) => {
    User.find({}, (err, data) => {
        if (err) return console.error(err);
        else res.json(data);
    });
});

app.post("/api/users", (req, res) => {
    const { username } = req.body;
    const user = new User({
        username: username,
    });
    user.save((err, data) => {
        if (err) return console.error(err);
        else {
            res.json({
                username: data.username,
                _id: data._id,
            });
        }
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
