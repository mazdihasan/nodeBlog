const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./../models/Users');

module.exports = function(passport){

    passport.use(
        new LocalStrategy({usernameField:'email'}, async (email,password,done)=>{
         try{
            // match user
            const user = await User.findOne({email:email});
            if(!user){
                return done(null,false,{message:'That email is not registered'})
            }

            // check verified user status 
            if(!user.verified) return done (null,false,{message:'You Email is Not verified Yet'});

            //match password
            const verifyPassword = await bcrypt.compare(password, user.password);
            if(!verifyPassword) return done(null, false, {message: 'Invalid Password'}); 
            return done(null, user, {message: 'Login Success'});

        }catch(err){
            return done(err, null, {message: 'Server Error'});
        }
           
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user._id);
      });
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
    }); 

}