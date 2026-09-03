const users = [
    { id: 1, username: "quan" },
    { id: 2, username: "an" },
    { id: 5, username: "binh" }
];

export function getUserById(req, res) {
    const id = Number(req.params.id);

    const user = users.find(user => user.id === id);

    res.json(user);
}