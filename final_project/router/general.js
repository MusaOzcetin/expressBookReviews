const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!doesExist(username)) {
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists! Hi again, " + username});
      }
    }
    return res.status(404).json({message: "Unable to register user."});
});



// Get the book list available in the shop
public_users.get('/', function(req, res) {
    const fetchBooksPromise = new Promise((resolve, reject) => {
        resolve(books);
    });
    fetchBooksPromise
      .then((allBooks) => {
        res.send(JSON.stringify(allBooks, null, 4));
      })
      .catch((error) => {
        console.error('Error fetching books:', error.message);
        res.status(500).send('Server Error');
      });
  });


// Get book details based on ISBN

public_users.get('/isbn/:isbn', function(req, res) {
    const isbn = req.params.isbn;
  
    const fetchBookPromise = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject(new Error('Book not found'));
        }
    });
  
    fetchBookPromise
      .then((book) => {
        res.send(JSON.stringify(book, null, 4));
      })
      .catch((error) => {
        console.error('Error fetching book details:', error.message);
        res.status(404).send('Book not found');
      });
  });
  
// Get book details based on author

public_users.get('/author/:author', function(req, res){
    const searchedAuthor = req.params.author.toLocaleLowerCase();

    const fetchBookPromise = new Promise((resolve, reject)=>{
        const matchingBooks = Object.values(books).filter(book => book.author.toLocaleLowerCase() == searchedAuthor);
        if(matchingBooks.length > 0){
            resolve(matchingBooks);
        } else{
            reject(new Error('Book not found'));
        }
    });
    fetchBookPromise
    .then((matchingBooks)=>{
        res.send(JSON.stringify(matchingBooks));
    })
    .catch((error)=>{
        res.status(404).send('Book not found');

    })
})


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const searchedTitle = req.params.title.toLocaleLowerCase();

    const fetchBookPromise = new Promise((resolve, reject)=>{
        const matchingBooks = Object.values(books).filter(book => book.title.toLocaleLowerCase() == searchedTitle);
        if(matchingBooks.length > 0){
            resolve(matchingBooks);
        } else{
            reject(new Error('Book not found'));
        }
    });
    fetchBookPromise
    .then((matchingBooks)=>{
        res.send(JSON.stringify(matchingBooks));
    })
    .catch((error)=>{
        res.status(404).send('Book not found');

    })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(JSON.stringify(books[isbn].reviews));
});

module.exports.general = public_users;
