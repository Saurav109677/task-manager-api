const mongoose = require('mongoose')
const validator= require('validator')
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./Task')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true                       //sanitization ... means make things we can do to make the data look good. like trim, lowercase etc
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        validate(value){
            if(value.toLowerCase().includes('password'))
                throw new Error('Password should not be password!')
        }
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){                // validator library validatorsss
            if(!validator.isEmail(value))
                throw new Error('Email is not valid!!')
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){         //it should be validate()  Custom validators
            if(value<0)
                throw new Error('Age must be a poitive number!')
        }
    },

    tokens:[
        { 
            token:{
            type:String,
            required:true  
            }
        }
    ],
    avatar:{
        type:Buffer
    }
},
{ timestamps:true})

userSchema.virtual('tasks', {
    ref: 'Task' , //model name
    localField : '_id',   // the field to join in User model
    foreignField: 'owner'   // the field to join in Task model
})

// to hide the private data
// when data is being stringify then this funciton is automatically called
// when res.send() is called it calls stringify
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

// methods is applicable to an instance and not on the model
userSchema.methods.generateAuthToken = async function(){
   const user = this
    const token= jwt.sign({ _id:user._id.toString() },'secretcode')

    //saving the token to the db as a sub-document
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token;
}

//login //statics method are applicable to the model User whereas //method is applicable to instances
userSchema.statics.findByCredentials= async (email,password)=>{
    const user = await User.findOne({email})

    if(!user){
        throw new Error('Unable to login')
    }
    
    const isMatch= await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user;
}



//Middleware provided by mongoose... 
//making password hashed using bcrypt whenever the passowrd is inserted or updated
//using middleware
// since ()=>{} do not binds the funcition that is why we cant use shortcut
userSchema.pre('save', async function (next) {       // save is the middlware we are using .. see docs
    const user=this
    //console.log('just before saving...');

    if(user.isModified('password')){
        user.password= await bcrypt.hash(user.password,8)
    }

    next()                                          // called when we are done... otherwise it will
})                                                   // think that some operation is going on before saving the user

//Middleware to remove tasks when a user is removed
userSchema.pre('remove',async function(next){
    const user = this
     await Task.deleteMany({owner:user._id})
     next()
})

const User=mongoose.model('User',userSchema)


// const me=new User({
//     name:'      Vrndavaneshwari   ',
//     email:'SAURAV@GMAIL.COM',
//     password:'jhjhPassword'
// })

// me.save().then((data)=>{
//     console.log(data);
// }).catch((error)=>{
//     console.log(error);
// })

module.exports=User