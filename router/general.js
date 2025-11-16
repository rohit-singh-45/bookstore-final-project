const express = require('express');
const general = express.Router();
const books = require('../booksdb.js');

// In-memory "database" for users
const users = {};
let sessions = {}; // simple session storage for logged-in users

// ------------------------
// Task 1 & Task 10: Get all books
// ------------------------
general.get('/books', (req, res) => {
    res.json(books);
});

general.get('/async/books', async (req, res) => {
    try {
        const allBooks = await Promise.resolve(books);
        res.json(allBooks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------
// Task 2 & Task 11: Get book by ISBN
// ------------------------
general.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    if (books[isbn]) res.json(books[isbn]);
    else res.status(404).json({ message: "Book not found" });
});

general.get('/async/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const book = await Promise.resolve(books[isbn]);
        if (book) res.json(book);
        else res.status(404).json({ message: "Book not found" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------
// Task 3 & Task 12: Get books by Author
// ------------------------
general.get('/author/:author', (req, res) => {
    const author = req.params.author;
    const results = Object.values(books).filter(b => b.author === author);
    if (results.length > 0) res.json(results);
    else res.status(404).json({ message: "No books found for this author" });
});

general.get('/async/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const results = await Promise.resolve(
            Object.values(books).filter(b => b.author === author)
        );
        if (results.length > 0) res.json(results);
        else res.status(404).json({ message: "No books found for this author" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------
// Task 4 & Task 13: Get books by Title
// ------------------------
general.get('/title/:title', (req, res) => {
    const title = req.params.title;
    const results = Object.values(books).filter(b => b.title === title);
    if (results.length > 0) res.json(results);
    else res.status(404).json({ message: "No books found for this title" });
});

general.get('/async/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const results = await Promise.resolve(
            Object.values(books).filter(b => b.title === title)
        );
        if (results.length > 0) res.json(results);
        else res.status(404).json({ message: "No books found for this title" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------
// Task 5: Get reviews for a book
// ------------------------
general.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    if (books[isbn]) res.json(books[isbn].reviews || {});
    else res.status(404).json({ message: "Book not found" });
});

// ------------------------
// Task 6: Register a new user
// ------------------------
general.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });
    if (users[username]) return res.status(409).json({ message: "User already exists" });
    users[username] = { password };
    res.json({ message: "User registered successfully" });
});

// ------------------------
// Task 7: Login user
// ------------------------
general.post('/customer/login', (req, res) => {
    const { username, password } = req.body;
    if (!users[username] || users[username].password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const sessionId = Math.random().toString(36).substring(2);
    sessions[sessionId] = username;
    res.cookie('sessionId', sessionId, { httpOnly: true });
    res.json({ message: "Login successful" });
});

// Middleware for authentication
function authMiddleware(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId || !sessions[sessionId]) return res.status(401).json({ message: "Unauthorized" });
    req.user = sessions[sessionId];
    next();
}

// ------------------------
// Task 8: Add/update review
// ------------------------
general.put('/customer/auth/review/:isbn', authMiddleware, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
    books[isbn].reviews[req.user] = review;
    res.json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

// ------------------------
// Task 9: Delete review
// ------------------------
general.delete('/customer/auth/review/:isbn', authMiddleware, (req, res) => {
    const isbn = req.params.isbn;
    if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
    delete books[isbn].reviews[req.user];
    res.json({ message: "Review deleted", reviews: books[isbn].reviews });
});

module.exports = general;
