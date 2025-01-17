const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: false },
    exercises: [
        {
            description: { type: String },
            duration: { type: Number },
            date: { type: String, required: false },
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

app.get("/api/users/:id/logs", (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) return console.error(err);
        else {
            let logs = user.exercises;
            if (req.query.from) {
                let from = new Date(req.query.from) == "Invalid Date" ? new Date() : new Date(req.query.from);
                from.setHours(0, 0, 0, 0);
                logs = logs.filter((log) => new Date(log.date) >= new Date(from));
            }
            if (req.query.to) {
                let to = new Date(req.query.to) == "Invalid Date" ? new Date() : new Date(req.query.to);
                to.setHours(0, 0, 0, 0);
                logs = logs.filter((log) => new Date(log.date) <= new Date(to));
            }
            if (req.query.limit) {
                logs = logs.slice(0, req.query.limit);
            }
            return res.json({
                _id: user._id,
                username: user.username,
                count: logs.length,
                log: logs,
            });
        }
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
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const dateStr = date.toDateString();

    const exercise = {
        description: description,
        duration: +duration,
        date: dateStr,
    };

    User.findByIdAndUpdate(_id, { $push: { exercises: exercise } }, { new: true }, (err, user) => {
        if (err) return console.error(err);
        else
            res.json({
                username: user.username,
                description: exercise.description,
                duration: exercise.duration,
                date: exercise.date,
                _id: user.id,
            });
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
