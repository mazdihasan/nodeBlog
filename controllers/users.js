const User = require('./../models/Users');
require('dotenv').config();
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const nMailer = require('nodemailer');



// Register Controller function 
exports.registerUser = async (req, res)=>{

    const {name,phone,email,password,password2} = req.body;
    let errors= [];
 
    //check all require field
     if(!name || !phone || !email || !password || !password2){
         errors.push({msg: 'Please Fill All Field'});
     }
     // phone number check 
     if(isNaN(phone)){
         errors.push({msg:'Phone Field Only Number Allowed'});
     }
 
     if(phone.length > 11 || phone.length < 11){
         errors.push({msg: 'Phone number should be 11 Characters'});
     }
     // password match   
     if(password !== password2){
         errors.push({msg:'Password Not match'});
     }
 
     //check password length 
     if(password.length < 6){
         errors.push({msg:'Password should be at least 6 characters'});
     }
     // check Email Exit Check 
     const emailExist = await User.findOne({email:email});
     if(emailExist){
         errors.push({msg:'Email Already Exist. Please logIn'});
     }
 
        // Generate hash password 
     const salt = await bcrypt.genSalt(10);
     const hashPassword = await bcrypt.hash(password,salt);

     // Generate Token 

     const token = jwt.sign({
        data: {email:email}
      }, process.env.JWT_TOKEN, { expiresIn: '1h' });
 
     if(errors.length > 0 ){
         res.render('register',{errors,name,phone,email,password,password2})
     }else{
        let newUser = new User({
            name:name,
            phone:phone,
            email:email,
            password:hashPassword,
            token:token
        });
   
 // save user in database
        try{
 
         let saveUser = await newUser.save();

        //Send Mail Configaration
         const transporter =  nMailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'tyrel.bruen@ethereal.email',
                pass: 'YQUYHqdBWNAyzRgR2z'
            }
         });

         // html message 
         const mail_message = `Hi ${saveUser.name}</br> Thank you for Registration myBlog.com</br>
         Please Click the below link for complete your registration </br></br> Please remember it will expire withing 1 hour </br></br>
         <a href="http://localhost:5000/users/verify/${saveUser.token}">${saveUser.token}</a>` ;

         // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"My Blog 👻" <myblog@example.com>', // sender address
            to: saveUser.email, // list of receivers
            subject: "Verify Your Mail", // Subject line
            html: mail_message, // html body
        });
        // redirect after complete registration
        if (info){
            req.flash('success_msg','Registration complete. please verify your Email');
            console.log(saveUser);
            res.redirect('/users/login');
        }

        }catch(err){
 
         errors.push({msg:err});
         
        }
     }
 

}

// verify User controller 
exports.verifyUsers = async(req,res)=> {
    const token = req.params.token;
    try{
        const tokenVerify = await jwt.verify(token,process.env.JWT_TOKEN);
        let userEmail = tokenVerify.data.email;
        //res.send(userEmail);
        const update = await User.findOneAndUpdate({email:userEmail},{verified:true});
        if(update){
            req.flash('success_msg','Verified Your email Succesfully. Please Login Now');
            res.redirect('/users/login');
        }
    }catch(err){
       // res.send(err);
        req.flash('error_msg','Your Verify token not valid please try again')
    }
    
}


// Reset Password Controller 
exports.resetPassword = async(req, res)=>{

    //console.log(req.body.email);
    
     const email = req.body.email;
     const user = await User.findOne({email:email});
    
     if(!user){
         req.flash('error_msg', 'No User Register with this Email');
         res.redirect('/users/resetpassword');
     }
    
  //console.log(user);
    
     const resetToken = jwt.sign({
        data: {email:user.email}
      }, process.env.JWT_RESET_TOKEN, { expiresIn: '1h' });
    
    console.log(resetToken);
    
     try{
    
       // update reset link 
        const update = await User.findOneAndUpdate({email:user.email},{resetLink:resetToken});
        console.log(update);
    if(update){
       //Send Mail Configaration
             const transporter =  nMailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'tyrel.bruen@ethereal.email',
                    pass: 'YQUYHqdBWNAyzRgR2z'
                }
             });
    
             // html message 
             const mail_message = `Hi ${user.name}</br> Please Click Bellow Link To Reset Your Password </br> <a href="http://localhost:5000/users/passwordchange/${resetToken}">${resetToken}</a>`;
    
             // send mail with defined transport object
            let mailSend = await transporter.sendMail({
                from: '"My Blog 👻" <myblog@example.com>', // sender address
                to: user.email, // list of receivers
                subject: "Reset Passwrod", // Subject line
                html: mail_message, // html body
            });
            // redirect after complete registration
           
            if(mailSend){
                req.flash('success_msg','An Email is Sent to Your Mail Box Please check');
                res.redirect('/users/notification');
            }
        }else{
            req.flash('error_msg', 'Something Wrong Please Try again');
            res.redirect('/users/resetpassword')
        }
    
    
     }catch(err){
            res.send(err);
     }
    
    }
// password change controller 

exports.passwordChange = async(req, res)=>{
    //console.log(req.body);
    const {password,password2,resettoken} = req.body;

    // password match   
    if(password !== password2){
        req.flash('error_msg','Password not Match');
        res.redirect(`/users/passwordchange/${resettoken}`);
    }
       // Generate hash password 
       const salt = await bcrypt.genSalt(10);
       const hashPassword = await bcrypt.hash(password,salt);

    try{
        const resetToken = await jwt.verify(resettoken,process.env.JWT_RESET_TOKEN);
        let userEmail = resetToken.data.email;
        const update = await User.findOneAndUpdate({email:userEmail},{password:hashPassword});
        if(update){
            req.flash('success_msg','Your Password Update Successfully. Please Login Now');
            res.redirect('/users/login');
        }
    }catch(err){
       // res.send(err);
        req.flash('error_msg','Your Verify token not valid please try again')
    }

}