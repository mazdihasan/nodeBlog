const express = require('express');
const router = express.Router();
const User = require('./../models/Users');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {isAdmin,notAdmin} = require('./../config/auth');
const {registerUser,verifyUsers,resetPassword,passwordChange} = require('./../controllers/users');
require('dotenv').config();
const  jwt  = require('jsonwebtoken');
const nMailer = require('nodemailer');

// Login Route 
router.get('/login',notAdmin, (req, res)=>{
    res.render('login');
});

// Login Handeler 
router.post('/login', 
passport.authenticate(
'local',{
    successRedirect:'/nd-admin/dashboard',
    failureRedirect:'/users/login',
    failureFlash:true
})
);

//Register Page Render
router.get('/register', (req, res)=>{
    res.render('register',{message:'Register'});
});

// Register Handeler
router.post('/register', registerUser);

// verify user 
router.get('/verify/:token', verifyUsers);

// reset password router 

router.get('/resetpassword',async(req, res)=>{
    res.render('resetpassword');
});

// rest passwrod Handeler 

router.post('/resetpassword', resetPassword);

// password change route 

router.get('/passwordchange/:resetLink',(req, res)=>{
    const resetToken = req.params.resetLink;
    res.render('passwordchange',{resetToken:resetToken});

});


// password change handelar 
router.post('/passwordchange', passwordChange );

// user notification route 
router.get('/notification', (req, res)=>{
res.render('notification');
});



module.exports = router;