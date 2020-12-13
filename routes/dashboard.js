const express = require('express');
const Article = require('./../models/Articles');
const User = require('./../models/Users');
const bcrypt = require('bcryptjs');
const path = require('path');
const {isAdmin} = require('../config/auth');
const router = express.Router();
const {userArticle,viewSingleArticle,editPost,deletePost,postUpdate,newPost,userProfileUpdate,logOut} = require('./../controllers/dashboard');



// Dashboard Page Route 
router.get('/nd-admin',isAdmin, (req, res)=>{
    res.redirect('/nd-admin/dashboard');
});

router.get('/dashboard',isAdmin, (req, res)=>{
    res.render('dashboard',{user:req.user});
});
  
// user All article route 
router.get('/user-article',isAdmin,userArticle);

// view Single article route 
router.get('/user-article/:slug',isAdmin, viewSingleArticle);

// post edit route 
router.get('/user-article/edit/:id', isAdmin, editPost);

// post delete route 
router.delete('/user-article/:id',isAdmin, deletePost);

// post update route 
router.post('/user-article/edit/:id',isAdmin,postUpdate);

// user new  post route 
router.get('/new-blog-post',isAdmin,(req,res)=>{
    const user= req.user;
    res.render('new_blog_post', {user:user});
});

// user new post update Handelar
router.post('/new-blog-post',isAdmin, newPost);

// User Profile Route 
router.get('/user-profile',isAdmin, (req,res)=>{
    const user= req.user;
    res.render('user_profile',{user:user});
});

// User profile Update Handeler 
router.post('/user-profile',isAdmin, userProfileUpdate);

// login route 
router.get('/logout',isAdmin, logOut);


module.exports = router;