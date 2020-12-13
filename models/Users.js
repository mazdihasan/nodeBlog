const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        require:false
    },
    address:{
        type:String,
        require:false
    },
    city:{
        type:String,
        require:false
    },
    description:{
        type:String,
        require:false
    },
    zip:{
        type:String,
        require:false
    },
    image:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    },
    verified:{
        type:Boolean,
        default:false
    },
    token:{
        type:String
    },
    resetLink:{
        type:String
    
    }
});

//Export the model 

module.exports = mongoose.model('User', UserSchema);