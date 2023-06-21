import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import pool from '../db.js';
import helpers from './helpers.js';

passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length > 0) {
    const user = rows[0];
   
    if (user[0].password) {//del array cambio a json y obtenemos
    const validPassword = await helpers.matchPassword(password, user[0].password);
    console.log(password);
    console.log(user.password);
    console.log(" funciona el desencriptador");
    if (validPassword) {
      done(null, user, req.flash('success', 'Welcome ' + user.username));
    } else {
      done(null, false, req.flash('message', 'Incorrect Password'));
    }
  } if (user[0].password==null ) {
    done(null, false, req.flash('message', 'User does not have a password'));
    console.log(password)
    console.log(user.password)
    console.log("no funciona el desencriptador");
  }
  } else {
    return done(null, false, req.flash('message', 'The Username does not exists.'));
  }
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, username, password, done) => {
  const {fullname}= req.body;
  const newUser ={
    username,
    password,
    fullname,
    rol:'usuario'
  };
  newUser.password = await helpers.encryptPassword(password);
  // Saving in the Database
  const result = await pool.query('INSERT INTO users SET ? ', [newUser]);
  newUser.id = result.insertId;
  return done(null, newUser);
}));


  passport.use('local.newadmin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    
    passReqToCallback: true
  }, async (req, username, password, done) => {
  const {fullname}= req.body;
  const newUser ={
    username,
    password,
    fullname,
    rol:'admin'
  };
newUser.password = await helpers.encryptPassword(password);
// Saving in the Database
const result = await pool.query('INSERT INTO users SET ? ', [newUser]);
newUser.id = result.insertId;
return done(null, newUser);
}));


  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  });
