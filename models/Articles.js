const mongoose = require('mongoose');
const marked = require('marked');
const slugify = require('slugify');
const createDomPurifier =  require('dompurify');
const {JSDOM} = require('jsdom');
const dompurify = createDomPurifier(new JSDOM().window);

const articleSchema = new mongoose.Schema({

    user_id:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    body:{
        type:String
    },
    visibility:{
        type:String,
        default:'Public'
    },
    status:{
        type:String,
        default:'Draft'
    },
    Schedule:{
        type:String,
        default:'Now'
    },
    createDate:{
        type:Date,
        default:Date.now
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    sanitizedHtml:{
        type:String,
        required:true
    },
    image:{
        type:String
       
    }  
})

articleSchema.pre('validate', function (next){
    if(this.title){
        this.slug = slugify(this.title,{ lower:true, strict:true })
    }
    if(this.body){
      this.sanitizedHtml =  dompurify.sanitize(marked(this.body));
    }
    next();
});

module.exports = mongoose.model('Article' , articleSchema);