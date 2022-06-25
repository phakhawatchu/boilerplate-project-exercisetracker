const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

let userSchema = new mongoose.Schema({
    username: String,
    count: Number,
    log: [
        {
            description: String,
            duration: Number,
            date: Date,
        },
    ],
});

let User = mongoose.model("User", userSchema);

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
        count: 0,
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

app.post("/api/users/:id/exercises", (req, res) => {
    const _id = req.params.id;
    const { description, duration } = req.body;
    const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();

    User.findById(_id, (err, data) => {
        if (err) return console.error(err);
        else {
            data.count = data.count + 1;
            data.log.push({
                description: description,
                duration: duration,
                date: date,
            });
            data.markModified("count");
            data.markModified("log");
            data.save((err, data) => {
                if (err) return console.error(err);
                else {
                    res.json({
                        username: data.username,
                        description: data.log[data.log.length - 1].description,
                        duration: data.log[data.log.length - 1].duration,
                        date: data.log[data.log.length - 1].date,
                        _id: data._id,
                    });
                }
            });
        }
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
