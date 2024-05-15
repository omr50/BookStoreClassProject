const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const db = require('../../db')
const ensureAuthenticated = require('../../middleware/auth').ensureAuthenticated

// Route for Login Page
router.post('/login', passport.authenticate('local', { failureRedirect: '/auth/login?badmessage=Incorrect Username or Password!' }),
  async (req, res) => {

    // set cookie
    res.cookie('isLoggedIn', 'true', { secure: true, sameSite: 'Strict' }); // Notice no httpOnly flag

    console.log("REQUEST BODY OF THE LOGIN", req.body);
    // cart is stringified, so json parse it.
    let cartData = req.body.cart == '' ? [] : JSON.parse(req.body.cart);
    console.log("GOT CART DATA", cartData, "AND TYPE __", typeof cartData);

    const rows = await new Promise((resolve, reject) => {
      console.log("USER IDDDDDD", req.user.id)
      db.query('SELECT * FROM carts WHERE user_id = $1', [req.user.id], (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result.rows);
         }
       })
      });

      console.log("ALL ROWS", rows)
      let dbCart = [];
      if (rows.length !== 0) {
          console.log("GOT ALL ROWS", rows);
          // compare both
          dbCart = JSON.parse(rows[0].cart);
          console.log("PARSED DB CART", dbCart);
          console.log("DB CART------------------", dbCart, "_____TYPE__________", typeof dbCart)
          cartData.forEach(localItem => {
          const existsInDb = dbCart.filter(dbItem => dbItem.title === localItem.title);
          if (existsInDb.length === 0) {
            dbCart.push(localItem);  // Add the local item to the dbCart if it doesn't exist
          }
  });
      await new Promise((resolve, reject) => {
      db.query('UPDATE carts SET cart = $1 WHERE user_id = $2', [JSON.stringify(dbCart), req.user.id], (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result.rows);
         }
       })
      });
      } 
      // if no rows then we can just save the new one directly
      else {
       await new Promise((resolve, reject) => {db.query(`INSERT INTO carts (user_id, cart) VALUES ($1, $2)`, [req.user.id, req.body.cart], (err, result) => {
        if (err) {
          reject(error);
        } else {
            resolve(result.rows);
         }
       })
        })}
        

    // merge carts together if user cart already exists
    // if (user cart)
    // merge and update database
    // else
    //  insert cart into database

    req.session.save((err) => {  // Force the session to be saved
      if (err) {
        // handle session save error
      }
      const isAuthenticated = true; 
      if (rows.length !== 0) {
        cartData = dbCart;
      }
      cartData = JSON.stringify(cartData)
      res.cookie('cart', cartData, { maxAge: 24 * 60 * 60 * 1000 });
      console.log("RIGHT BEFORE SEND", cartData)
      res.render('index', { isAuthenticated });  // Render after saving session
    });
    // we will have a script tag in which we use ejs to update the cart data dynamically.
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
    res.render('login-page', {goodmessage, badmessage})
});

router.get('/signup', (req, res) => {
    const goodmessage = req.query.goodmessage;
    const badmessage = req.query.badmessage;
    res.render('signup-page', {goodmessage, badmessage})
})

// Route for Logout
router.get('/logout', (req, res, next) => {
  res.clearCookie('isLoggedIn');
  req.logout(function(err) {
    console.log("Logged out the user!")
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.post('/cart', ensureAuthenticated, async (req, res) => {
    console.log("GET BODY /CART", req.body);
    // WARNING: express.json() parser turns the stringified
    // json back into json, so we have to manually stringify
    // it again. 
    const cart = JSON.stringify(req.body);

    console.log("CART", cart, "_____ITS TYPE IS____", typeof cart)
    await new Promise((resolve, reject) => {
      db.query('UPDATE carts SET cart = $1 WHERE user_id = $2', [cart, req.user.id], (err, result) => {
        if (err) {
            reject(err);
            console.log("GOT ERROR")
        } else {
            resolve(result.rows);
         }
       })
      });

    res.status(200).json({});
})

// Route to get the cart data
router.get('/cart', ensureAuthenticated, async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      db.query('SELECT cart FROM carts WHERE user_id = $1', [req.user.id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows);
        }
      });
    });

    if (result.length > 0) {
      const cart = result[0].cart;
      res.status(200).json({ cart });
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/checkout', (req, res) => {
  res.render('checkout');
})
// Export the router
module.exports = router;