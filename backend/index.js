const express = require('express');
const PORT = process.env.PORT || 3000;
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs')
const db = require('./db')
const passport = require('passport');
const isAuth = require('./middleware/auth.js')
// configure passport
require('./passport/passportSetup.js')(passport)

const app = express();
// Serve static files from a directory named 'public'
app.use(express.static(__dirname + '/public'));
// allow url-encoded data (from form submissions)
app.use(express.urlencoded({ extended: true }));

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

app.get('/order', (req, res) => {
    res.render('ordering-page')
})

app.get('/search', (req, res) => {
    res.render('search-page')
})

app.get('/search-results', async (req, res) => {
    const searchTerm = req.query.term; // Get the search term from query parameters
    const page = parseInt(req.query.page) || 1; // Get the current page number, default to 1
    console.log("TERM AND PAGE", searchTerm, page);
    const limit = 15; // Number of items per page
    const offset = (page - 1) * limit; // Calculate the offset

    try {
        // Assuming you're using a generic SQL-like query method. Adapt as necessary for your setup.
        const totalResults = await new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) AS count FROM books WHERE UPPER(title) LIKE UPPER($1)', [`%${searchTerm}%`], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.rows[0].count); // Assuming 'result.rows[0].count' correctly accesses the count
            }
            });
        });
        const totalPages = Math.ceil(totalResults / limit);

        const rows = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM books WHERE UPPER(title) LIKE UPPER($1) LIMIT $2 OFFSET $3', [`%${searchTerm}%`, limit, offset], (err, result) => {
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



app.listen(PORT, () => {
    db.createTables();

  console.log(`Server is running on http://localhost:${PORT}`);
});