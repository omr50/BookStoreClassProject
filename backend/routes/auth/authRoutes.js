const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const db = require('../../db')

// Route for Login Page
router.post('/login', passport.authenticate('local', { failureRedirect: '/auth/login?badmessage=Incorrect Username or Password!' }),
  (req, res) => {
    console.log("WORKED!!!")
    res.redirect('/'); // Redirect to homepage or user dashboard after successful login
  }
);

router.post('/signup', async (req, res) =>{
  try {
    const username = req.body.username;
    const password = req.body.password;
    if (password.legnth < 6) {
      res.redirect('/auth/signup?badmessage=Password must be 6 characters or more!')
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // check if user exists, if so, notify user.
    const rows = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result.rows);
      }
    })
  });


    if (rows.length != 0) {
      res.redirect('/auth/signup?badmessage=Username already exists')
    }

    // else create user and redirect to login page with 'successfully created user message'
    const createdUser = await new Promise((resolve, reject) => {
      db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword], (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result.rows);
      }
    })
  });
    console.log("CREATED USER", createdUser)
    res.redirect('/auth/login?goodmessage=Successfully created account!');
  } catch (e) {
    console.log("GOT ERROR FROM SIGNUP", e);
  }
})

router.get('/login', (req, res) => {
    const goodmessage = req.query.goodmessage;
    const badmessage = req.query.badmessage;
    console.log("Message good:", goodmessage, "bad", badmessage)
    res.render('login-page', {goodmessage, badmessage})
});

router.get('/signup', (req, res) => {
    const goodmessage = req.query.goodmessage;
    const badmessage = req.query.badmessage;
    console.log("Message good:", goodmessage, "bad", badmessage)
    res.render('signup-page', {goodmessage, badmessage})
})

// Route for Logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    console.log("Logged out the user!")
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Export the router
module.exports = router;