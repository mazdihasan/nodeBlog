const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const indexRoutes = require('./routes/index');
const loginRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const User = require('./models/Users');
const flash = require('connect-flash');
const session = require('express-session')
const passport = require('passport');
const methodOverride = require('method-override')
const fileUpload = require('express-fileupload');

// initial Express App
const app = express();

// Passport Config 
require('./config/passport')(passport);

//DB configaration 
const db = require('./config/keys').MongoURI;

//Connect to Mongoose 
mongoose.connect(db,{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify: false })
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

//EJS
app.set('view engine', 'ejs');


//Get data Form Field BodyParser 
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'));

// file upload 
app.use(fileUpload({
  createParentPath: true,
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));


// static folder assign 
app.use('/includes',express.static('includes'));
app.use('/uploads', express.static('uploads'));


// Express Session 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
   }))

// passport session 
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global Flash Veriable 

app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// all routes

app.use('/',indexRoutes);
app.use('/users',loginRoutes);
app.use('/nd-admin',dashboardRoutes);


// redirect if status 404 

app.get('*', function(req, res, next){
    user = req.user;
  if(user){
    return res.redirect('/nd-admin/dashboard');
  }else{
    const status = res.status(404);
    if(status) res.redirect('/');
    next();
  }
});

//server PORT Configaration 
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port http://127.0.0.1:${PORT}`));