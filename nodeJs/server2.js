var express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  mongoose = require('mongoose'),
  bcrypt = require('bcryptjs'),
  nev = require('./index2')(mongoose);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/iitbit');

// our persistent user model
var info = require('./models/user');

// sync version of hashing function
var myHasher = function(password, tempUserData, insertTempUser, callback) {
  var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  return insertTempUser(hash, tempUserData, callback);
};

// async version of hashing function
myHasher = function(password, tempUserData, insertTempUser, callback) {
  bcrypt.genSalt(8, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      return insertTempUser(hash, tempUserData, callback);
    });
  });
};

// NEV configuration =====================
nev.configure({
  persistentUserModel: info,
  expirationTime: 6000, // 10 minutes

  verificationURL: 'http://139.59.78.201:8000/email-verification/${URL}',
  transportOptions: {
    service: 'mail.iitbit.com',
    auth: {
      user: 'mail@iitbit.com',
      pass: 'Apsara@12345'
    }
  },

  hashingFunction: myHasher,
  passwordFieldName: 'password',
}, function(err, options) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('configured: ' + (typeof options === 'object'));
});

nev.generateTempUserModel(info, function(err, tempUserModel) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('generated temp user model: ' + (typeof tempUserModel === 'function'));
});


// Express stuff =========================
app.use(bodyParser.urlencoded({extended: false}));
app.get('/', function(req, res) {
//  res.sendFile('index.html', {
//    root: __dirname
//  });
console.log('OK');
});

app.post('/signup', function(req, res) {
  var email = req.body.email;

  // register button was clicked
//  if (req.body.type === 'register') {
var nm=  req.body.name;    
var pw = req.body.password;
    var newUser = new info({
      email: email,
      password: pw,
      name: nm
    });


    nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
      if (err) {
        return res.status(404).send('ERROR: creating temp user FAILED');
      }

      // user already exists in persistent collection

      if (existingPersistentUser) {
        return res.json({
          msg: 'You have already signed up and confirmed your account. Did you forget your password?'
        });
      }

      // new user created
      if (newTempUser) {
        var URL = newTempUser[nev.options.URLFieldName];

        nev.sendVerificationEmail(email, URL, function(err, info) {
          if (err) {
            return res.status(404).send('ERROR: sending verification email FAILED');
          }
          res.json({
            msg: 'An email has been sent to you. Please check it to verify your account.',
            info: info
          });
        });

      // user already exists in temporary collection!
      } else {
        res.json({
          msg: 'You have already signed up. Please check your email to verify your account.'
        });
      }
    });

 }); // resend verification button was clicked
  app.post('/resend', function(req, res) {
    nev.resendVerificationEmail(email, function(err, userFound) {
      if (err) {
        return res.status(404).send('ERROR: resending verification email FAILED');
      }
      if (userFound) {
        res.json({
          msg: 'An email has been sent to you, yet again. Please check it to verify your account.'
        });
      } else {
        res.json({
          msg: 'Your verification code has expired. Please sign up again.'
        });
      }
    });
  
});


// user accesses the link that is sent
app.get('/email-verification/:URL', function(req, res) {
  var url = req.params.URL;

  nev.confirmTempUser(url, function(err, user) {
    if (user) {
      nev.sendConfirmationEmail(user.email, function(err, info) {
        if (err) {
          return res.status(404).send('ERROR: sending confirmation email FAILED');
        }
        res.json({
          msg: 'CONFIRMED!',
          info: info
        });
      });
    } else {
      return res.status(404).send('ERROR: confirming temp user FAILED');
    }
  });
});

app.listen(8000);
console.log('Express & NEV example listening on 8000...');

