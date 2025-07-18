const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Check if the user with the given username and password exists
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

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4))
});

const getBooksWithPromises = () => {
    axios.get('http://localhost:5000/')
        .then(response => {
            console.log("Books retrieved:", response.data);
        })
        .catch(error => {
            console.error("Error fetching books:", error.message);
        });
    }
getBooksWithPromises();

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn
    filteredBooks = res.send(books[isbn]);
    return res.status(300).json({ filteredBooks, message: "Books retrieved with isbn successfully" });
});  

const getBookByIsbnAsync = async (isbn) => {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        console.log("Book details:", response.data);
    } catch (error) {
        console.error("Error fetching book:", error.response?.data || error.message);
    }
};

getBookByIsbnAsync(2); 


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author
    let filteredBooks = Object.fromEntries(
        Object.entries(books).filter(([id, book]) => book.author === author)
    );
    return res.status(300).json({ filteredBooks, message: "Books retrieved with author successfully" });
});

const getBooksByAuthorAsync = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log("Books by author:", response.data.books);
    } catch (error) {
        console.error("Error fetching books by author:", error.response?.data || error.message);
    }
};

getBooksByAuthorAsync("Unknown");


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title
    let filteredBooks = Object.fromEntries(
        Object.entries(books).filter(([id, book]) => book.title === title)
    );
    return res.status(300).json({ filteredBooks, message: "Books retrieved with title successfully" });
});

const getBooksByTitleAsync = async (title) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
        console.log("Books by title:", response.data.books);
    } catch (error) {
        console.error("Error fetching books by title:", error.response?.data || error.message);
    }
};

getBooksByTitleAsync("The Epic Of Gilgamesh"); 

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn
    let filteredBooks = res.send(books[isbn].review);
    return res.status(300).json({ filteredBooks, message: "Books retrieved with title successfully" });
});


module.exports.general = public_users;
