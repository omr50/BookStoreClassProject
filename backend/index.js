require('dotenv').config()
const express = require('express');
const PORT = process.env.PORT || 3000;
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs')
const db = require('./db')
const passport = require('passport');
const isAuth = require('./middleware/auth.js').isAuth
const paypal = require('paypal-rest-sdk')
console.log(process.env.CLIENT_ID, "HI")
// configure passport
require('./passport/passportSetup.js')(passport)

const app = express();
// Serve static files from a directory named 'public'
app.use(express.static(__dirname + '/public'));
// allow url-encoded data (from form submissions)
app.use(express.urlencoded({ extended: true }));
// allows json parsing and use
app.use(express.json());

// view engine for dynamic rendering html
app.set('view engine', 'ejs')
app.set('views', './public/html')

// the session and passport initialization should go before the route definitions
app.use(session({
  secret: 'your_secret_key', // replace 'your_secret_key' with a real secret key
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(isAuth);

const authRoutes = require('./routes/auth/authRoutes.js');
app.use('/auth', authRoutes);

app.get('/', (req, res) => { 
    res.render('index')
})


app.get('/account', (req, res) => {
    res.render('account-page')
})

app.get('/cart', (req, res) => {
    res.render('cart')
})

app.get('/order', (req, res) => {
    res.render('ordering-page')
})

app.get('/search', (req, res) => {
    res.render('search-page')
})

// app.get('/search-results', async (req, res) => {
//     const searchTerm = req.query.term; // Get the search term from query parameters
//     const page = parseInt(req.query.page) || 1; // Get the current page number, default to 1
//     console.log("TERM AND PAGE", searchTerm, page);
//     const limit = 15; // Number of items per page
//     const offset = (page - 1) * limit; // Calculate the offset

//     try {
//         // Assuming you're using a generic SQL-like query method. Adapt as necessary for your setup.
//         const totalResults = await new Promise((resolve, reject) => {
//         db.query('SELECT COUNT(*) AS count FROM books WHERE UPPER(title) LIKE UPPER($1)', [`%${searchTerm}%`], (err, result) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result.rows[0].count); // Assuming 'result.rows[0].count' correctly accesses the count
//             }
//             });
//         });
//         const totalPages = Math.ceil(totalResults / limit);

//         const rows = await new Promise((resolve, reject) => {
//         db.query('SELECT * FROM books WHERE UPPER(title) LIKE UPPER($1) LIMIT $2 OFFSET $3', [`%${searchTerm}%`, limit, offset], (err, result) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result.rows);
//             }
//         });
//     });

//         console.log("GOT TOTAL PAGES AND ROWS", totalPages, rows);
//         res.render('search-results', {
//             rows: rows,
//             currentPage: page,
//             totalPages: totalPages,
//             searchTerm: searchTerm
//         });
//     } catch (error) {
//         console.error('Database query failed:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });
app.get('/search-results', async (req, res) => {
  const searchTerm = req.query.term || ''; // Get the search term from query parameters
  const searchType = req.query.searchType || 'title'; // Get the search type, default to 'title'
  const minPrice = parseFloat(req.query.minPrice) || 0; // Get the minimum price, default to 0
  const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER; // Get the maximum price, default to a large number
  const page = parseInt(req.query.page) || 1; // Get the current page number, default to 1
  const limit = 15; // Number of items per page
  const offset = (page - 1) * limit; // Calculate the offset

  let searchColumn;
  switch (searchType) {
    case 'author':
      searchColumn = 'author';
      break;
    case 'isbn':
      searchColumn = 'isbn';
      break;
    default:
      searchColumn = 'title';
  }

  try {
    // Query to get the total number of results
    const totalResultsQuery = `
      SELECT COUNT(*) AS count
      FROM books
      WHERE UPPER(${searchColumn}) LIKE UPPER($1)
      AND CAST(price AS NUMERIC) >= $2 AND CAST(price AS NUMERIC) <= $3
    `;
    const totalResults = await new Promise((resolve, reject) => {
      db.query(totalResultsQuery, [`%${searchTerm}%`, minPrice, maxPrice], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows[0].count); // Assuming 'result.rows[0].count' correctly accesses the count
        }
      });
    });

    const totalPages = Math.ceil(totalResults / limit);

    // Query to get the paginated results
    const searchQuery = `
      SELECT *
      FROM books
      WHERE UPPER(${searchColumn}) LIKE UPPER($1)
      AND CAST(price AS NUMERIC) >= $2 AND CAST(price AS NUMERIC) <= $3
      LIMIT $4 OFFSET $5
    `;
    const rows = await new Promise((resolve, reject) => {
      db.query(searchQuery, [`%${searchTerm}%`, minPrice, maxPrice, limit, offset], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows);
        }
      });
    });

    console.log("GOT TOTAL PAGES AND ROWS", totalPages, rows);
    res.render('search-results', {
      rows: rows,
      currentPage: page,
      totalPages: totalPages,
      searchTerm: searchTerm
    });
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).send('Internal Server Error');
  }
});


paypal.configure({
  'mode': 'sandbox',
  'client_id': process.env.CLIENT_ID,
  'client_secret': process.env.CLIENT_SECRET
});

app.post('/pay', (req, res) => {
    const cartData = JSON.parse(req.body.cartData);
    const items = []
    const total = 0;
    for (let item of cartData) {
      let currItem = {}
      currItem.name = item.title;
      currItem.sku = item.isbn;
      currItem.price = item.price;
      currItem.currency = "USD";
      currItem.quantity = item.quantity; 
    }
    console.log("CART DATA", cartData);
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Red Sox Hat",
                  "sku": "001",
                  "price": "25.00",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "25.00"
          },
          "description": "Customer Order"
      }]
  };
  app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "25.00"
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send('Success');
      }
  });
  });
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
              if(payment.links[i].rel === 'approval_url'){
                res.redirect(payment.links[i].href);
              }
            }
        }
      });
      
      });
  app.get('/cancel', (req, res) => res.send('Cancelled'));


app.listen(PORT, () => {
    db.createTables();

  console.log(`Server is running on http://localhost:${PORT}`);
});