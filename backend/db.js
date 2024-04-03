const { Pool } = require('pg');
const bcrypt = require('bcryptjs')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'example',
  port: 5432,
});

let myhash = ''
const texts = [
      `CREATE TABLE IF NOT EXISTS users (
          user_id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS books (
        ISBN VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        genre VARCHAR(255) NOT NULL,
        pubyear VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255),
        price NUMERIC
      );`,
      `CREATE TABLE IF NOT EXISTS carts (
        cart_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        cart VARCHAR(30000) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );`
      // Add more table creation queries here

      // QUERY FOR ADDING RANDOM PRICE ROWS 
      // UPDATE books SET price = ROUND((RANDOM() * (50 - 5) + 5)::numeric, 2);
    ];
// bcrypt
//   .genSalt(10)
//   .then(salt => {
//     console.log('Salt: ', salt)
//     return bcrypt.hash('fake_password', salt)
//   })
//   .then(hash => {

//     texts.push(`INSERT into users (username, password) VALUES ('bob', '${hash}');`);
//   })
//   .catch(err => console.error(err.message));

module.exports = {
  query: (text, params, callback = null) => {
    const promise = pool.query(text, params);
    if (callback) {
      // If a callback is provided, use it
      promise.then((res) => callback(null, res))
             .catch((err) => callback(err));
    } else {
      // Otherwise, return the promise
      return promise;
    }
  },

  createTables: async () => {
    const queryTexts = texts; 

    for (const queryText of queryTexts) {
      try {
        await module.exports.query(queryText, []);
        console.log('Query executed successfully:', queryText);
      } catch (err) {
        console.error('Error executing query:', err);
        // Decide how to handle the error. Break, continue, or throw.
        break; // Stops executing further if an error occurs
      }
    }
  }
};
