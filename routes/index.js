const express = require('express');
const User = require('./../models/Users');
const bcrypt = require('bcryptjs');
const {isAdmin} = require('./../config/auth');
const router = express.Router();

// Welcome Page
router.get('/', (req, res)=>{
    res.render('index.ejs',{message:'Login Page'});
});


// Prevent if someone try to access manually 

router.get('/users',isAdmin, (req, res)=>{
    res.redirect('/nd-admin/dashboard');
});







module.exports = router;