const User = require('./../models/Users');
const Article = require('./../models/Articles');
require('dotenv').config();
const path = require('path');
const {isAdmin} = require('../config/auth');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const nMailer = require('nodemailer');

// show all article 
exports.userArticle = async(req,res)=>{
    const user= req.user;
    const articles =  await Article.find({user_id:user._id}).sort({createDate:'desc'});  
    res.render('user_articles', {articles:articles});
}
// view single article 
exports.viewSingleArticle = async(req,res)=>{
    console.log(req.params.slug);
    try{
    const article = await Article.findOne({slug:req.params.slug});
    res.render('view_article', {article:article});
    }catch(err){
        console.log(err);
    }
}

// Edit Post Article 
exports.editPost = async (req, res)=>{
    const article = await Article.findById(req.params.id);
    res.render('post_edit', {article: article});
}


// Delete Post Article 
exports.deletePost = async(req, res)=>{
    await Article.findByIdAndDelete(req.params.id);
    req.flash('success_msg','You Post Delete Successfully');
    res.redirect('/nd-admin/user-article');
  }

// Post Update 
exports.postUpdate = async(req, res)=>{
 
    const {title,body,userId,} = req.body;
    const errors = [];
    let imageRename;
    let article = await Article.findById(req.params.id);
    
    
    // Image update work 
    if(req.files){
        images = req.files.image;
        
        const mineType = images.mimetype;
        
        if(mineType == 'image/png' || mineType == 'image/jpeg'){
            imageRename = userId+'_'+images.name+'_'+images.md5;
            
            images.mv(`uploads/posts/${imageRename}`, (err) =>{
            if(err){ return res.send(err)}
           });

        }else{
            errors.push('error_msg','File Not Supported');
        }
    }

    if(!title){
        errors.push({msg: 'Title field is required'});
    }
    if(!body){
        errors.push({msg: 'Please write something in Description Box'});
    }


    if(imageRename){
        article.title = req.body.title,
        article.body = req.body.body,
        article.image = imageRename
    }else{
        article.title = req.body.title,
        article.body = req.body.body
    }

    if(errors.length > 0 ){
        res.render('post_edit',{errors,article})
    }else{

         try{
           article = await article.save();
           req.flash('success_msg','Your Post update Successfully');
           res.redirect(`/nd-admin/user-article/edit/${article.id}`);
         }catch(e){
            req.flash('error_msg','Something Wrong Post Not Update');
            res.redirect('/nd-admin/user-article');
         }

    }
}

// Add New Article 

exports.newPost = async(req,res)=>{

    const {title,body,userId} = req.body;
    const errors = [];
    let imageRename ;

    // Image update work 
    // check if req.files have something 
    if(req.files){

        let images = req.files.image;
        const mineType = images.mimetype;
     
        if(mineType == 'image/png' || mineType == 'image/jpeg'){
        imageRename = userId+'_'+images.md5+'_'+images.name;
            
        images.mv(`uploads/posts/${imageRename}`, (err) =>{
        if(err){ return res.send(err)}
        
        });

        }else{
            errors.push('error_msg','File Not Supported');
        }
    }
  
   
  // title check 
    if(!title){
        errors.push({msg: 'Title field is required'});
    }
 // Check Unique Title    
    const titleExist = await Article.findOne({title:title});
    if(titleExist){
         errors.push({msg:'Please Title Field Should be Unique'});
    }
 // body field check 
    if(!body){
        errors.push({msg: 'Please write something in Description Box'});
    }

// check if image name exit 
   if(imageRename){
        var article = new Article ({
            user_id:userId,
            title: title,
            body:body,
            image:imageRename
        })
    }else{
        var article = new Article ({
            user_id:userId,
            title: title,
            body:body
        })
    }

    if(errors.length > 0 ){
        res.render('new_blog_post',{errors,title,body})
    }else{
    try {
      article = await article.save();
      console.log(article);
      req.flash('success_msg','Your Post Save Successfully');
      const rString= `/nd-admin/user-article/edit/${article._id}`;
      console.log(rString);
      res.redirect(rString);
    }catch(err){
        console.log(err);
        req.flash('error_msg','Something Wrong');
        res.render('new_blog_post', {article:article})
      
    }
}

}

// userProfile Update 

exports.userProfileUpdate = async(req,res)=>{

    const {name,email,password,phone,address,city,zip,description} = req.body;
    const errors= [];
    // check Email Exit Check 
    const user = await User.findById(req.user.id);

    let userImageRename ;
    // Image update work 
    // check if req.files have something 
    if(req.files){

        let userImages = req.files.image;
        const mineType = userImages.mimetype;
     
        if(mineType == 'image/png' || mineType == 'image/jpeg'){
        
        userImageRename = user._id+'_'+userImages.md5+'_'+userImages.name;
            
        userImages.mv(`uploads/users/${userImageRename}`, (err) =>{
        if(err){ return res.send(err)}
        
        });

        }else{
            errors.push('error_msg','File Not Supported');
        }
    }

    if(!user){
        errors.push({msg:'No account found'});
    }
   // name field 
   if(!name){
       errors.push({msg:'Please file your name field'});
   }

   if(user.email != email ){
       const emailExist = await User.findOne({email:email});
       if(emailExist){
           errors.push({msg:'Email Already Exist. Please Try Another One'});
       } 
   }
  
    // phone number check 
    if(isNaN(phone)){
        errors.push({msg:'Phone Field Only Number Allowed'});
    }

    if(phone.length > 11 || phone.length < 11){
        errors.push({msg: 'Phone number should be 11 Characters'});
    }
     
    //check password length 
    if(password.length < 6){
        errors.push({msg:'Password should be at least 6 characters'});
    }
    
       // Generate hash password 
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password,salt);

    if(errors.length > 0 ){
       res.render('user_profile',{errors})
   }else{
     
// save user in database
      try{

        if(userImageRename){
            user.name = name,
            user.phone = phone,
            user.password = hashPassword,
            user.address = address,
            user.city= city,
            user.description = description,
            user.zip = zip,
            user.image = userImageRename

        }else{
            user.name = name,
            user.phone = phone,
            user.password = hashPassword,
            user.address = address,
            user.city= city,
            user.description = description,
            user.zip = zip
        }


       const update = await user.save();
      // redirect after complete registration
      if(update){
       req.flash('success_msg','Your Profile Update Successfully');
       //console.log(update);
        res.redirect('/nd-admin/user-profile');

       }    
      }catch(err){

       errors.push({msg:err});
       
      }
   }

}

// LogOut 

exports.logOut = (req, res)=>{
    req.logOut();
    req.flash('success_msg','You are logged out');
    res.redirect('/users/login');
}