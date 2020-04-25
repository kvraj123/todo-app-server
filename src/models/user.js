const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const Task = require('../models/tasks')



const userSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: true,
        trim : true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowecase: true,
        validate(value) {
           if(!validator.isEmail(value)) {
               throw new Error('Email is not valid');
           }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
    },
    age: {
        type: Number,
        default: 8,
        validate(age) {
            if(age < 7) {
                throw new Error('Age must be greater than 8')
            }
        }
    },
    tokens: [
        {
            token : {
                type: String,
                require: true,
            }
        }
    ],
    avatar : {
        type: Buffer
    }
 },{
    timestamps: true
 })

 userSchema.virtual('tasks', {
     ref: 'Task',
     localField: '_id',
     foreignField: 'owner'
 })

// custom method on model instances to restrict data flow from userschema
 userSchema.methods.toJSON = function () {
     const user = this

     const userObject = user.toObject();

     delete userObject.password
     delete userObject.tokens
     delete userObject.avatar

     return userObject;
 }


 // custom method on model instances 
 userSchema.methods.generateToken =  async function() {
     const user = this;
     const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);

     user.tokens = user.tokens.concat({ token });
     await user.save();
     return token;

 }



 // custom method on model i.e Users
 userSchema.statics.findUserByCredential= async (email,password) => {
     const user = await Users.findOne({email});
     if(!user) {
         throw new Error('Invalid Credential');
     }

     const isMatch = await bcrypt.compare(password, user.password)

     if(!isMatch) {
         throw new Error('Invalid Credential');
     }

     console.log(user)
     return user;
 }

//  we not use arrow function beacuse we want to use this
// password hash
 userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
 })

// remove task based on user delete
 userSchema.pre('remove',async function(next) {
     const user = this
     await Task.deleteMany({owner: user._id})
     next();
 })
const Users = mongoose.model('Users',userSchema);


module.exports = Users




