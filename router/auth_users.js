const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('../booksdb.js');

let users = [];

const isValid = (username) => {
    return users.filter(u => u.username === username).length === 0;
};

const authenticatedUser = (username, password) => {
    return users.filter(u => u.username === username && u.password === password).length > 0;
};

let regd_users = express.Router();

/* ---------------- Task 6 - Register user ---------------- */

regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Missing fields" });

    if (!isValid(username))
        return res.status(400).json({ message: "User exists" });

    users.push({ username, password });
    res.json({ message: "User registered" });
});

/* ---------------- Task 7 - Login ---------------- */

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!authenticatedUser(username, password))
        return res.status(403).json({ message: "Invalid login" });

    const token = jwt.sign({ username }, "access");
    req.session.token = token;
    req.session.username = username;

    res.json({ message: "Logged in", token });
});

/* ---------------- Task 8 - Add/Modify Review ---------------- */

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.username;

    if (!books[isbn])
        return res.status(404).json({ message: "Book not found" });

    books[isbn].reviews[username] = review;

    res.json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

/* ---------------- Task 9 - Delete Review ---------------- */

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;

    if (books[isbn] && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.json({ message: "Review deleted" });
    }

    res.status(404).json({ message: "Review not found" });
});

module.exports.authenticated = regd_users;
