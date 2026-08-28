import express from "express";

const app = express();

app.use(express.json());

let users = [
    { id: 1, username: "quan", score: 10 },
    { id: 2, username: "an", score: 20 }
];

app.get("/users", (req, res) => {
    res.json(users);
});

app.get("/users/:id", (req, res) => {
    const id = Number(req.params.id);

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json(user);
});

app.post("/users", (req, res) => {
    const newUser = {
        id: users.length + 1,
        username: req.body.username,
        score: req.body.score
    };

    users.push(newUser);

    res.status(201).json(newUser);
});

app.patch("/users/:id", (req, res) => {
    const id = Number(req.params.id);

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    Object.assign(user, req.body);

    res.json(user);
});

app.delete("/users/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    users.splice(index, 1);

    res.json({
        message: "User deleted"
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});