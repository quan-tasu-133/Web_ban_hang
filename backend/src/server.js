import express from "express";

const app = express();

app.use(express.json());

let tasks = [
    {
        id: 1,
        title: "Học Node.js",
        completed: false
    },
    {
        id: 2,
        title: "Làm bài LeetCode",
        completed: true
    }
];

// GET
app.get("/", (req, res) => {
    res.json({
        message: "Task Manager API is running"
    });
});

app.get("/tasks", (req, res) => {
    res.json(tasks);
});

// POST
app.post("/tasks", (req, res) => {
    const { title } = req.body;

    const newTask = {
        id: tasks.length + 1,
        title: title,
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

// PATCH
app.patch("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const { title, completed } = req.body;

    if (title !== undefined) {
        task.title = title;
    }

    if (completed !== undefined) {
        task.completed = completed;
    }

    res.json(task);
});

// DELETE
app.delete("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const deletedTask = tasks.splice(index, 1);

    res.json({
        message: "Task deleted successfully",
        task: deletedTask[0]
    });
});

app.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
});