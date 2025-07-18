const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        // Generate token with username only
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: "1h" });

        // Store in session if needed
        req.session.authorization = {
            accessToken,
            username
        };

        // Return token to client (Postman)
        return res.status(200).json({
            message: "User successfully logged in",
            token: accessToken
        });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization?.username;

    // Validate inputs
    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Save or update review
    book.reviews[username] = review;

    return res.status(200).json({
        message: `Review added/updated for book ${isbn} by ${username}`,
        reviews: book.reviews
    });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    // Validate authentication
    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if review exists for user
    if (!book.reviews[username]) {
        return res.status(404).json({ message: "No review found for this user to delete" });
    }

    // Delete the review
    delete book.reviews[username];

    return res.status(200).json({
        message: `Review for book ${isbn} deleted by ${username}`
    });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
