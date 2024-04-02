const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')
const db = require('../db')

// take in passport object, and configure it
module.exports = function(passport) {
    passport.use(new LocalStrategy(
    (username, password, done) => {
        console.log("DID THE THING")
        db.query('SELECT user_id, username, password FROM users WHERE username = $1', [username], (err, result) => {
        if (err) { return done(err); }
        if (result.rows.length > 0) {
            const first = result.rows[0];
            bcrypt.compare(password, first.password, (err, isMatch) => {
            if (err) { return done(err); }
            if (isMatch) {
                // Passwords match! Log user in
                return done(null, { id: first.user_id, username: first.username });
            } else {
                // Passwords do not match!
                return done(null, false, { message: 'Incorrect password.' });
            }
            });
        } else {
            return done(null, false, { message: 'Incorrect username.' });
        }
        });
    }
    ));


    passport.serializeUser((user, done) => {
    done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
    db.query('SELECT user_id, username FROM users WHERE user_id = $1', [parseInt(id, 10)], (err, results) => {
        if(err){
        return done(err);
        }
        done(null, results.rows[0]);
    });
    });
}
