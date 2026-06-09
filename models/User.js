const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Хэрэглэгчийн нэрийг оруулна уу'],
    },
    ovog:{
        type: String,
        required: [true, 'Хэрэглэгчийн овгийг оруулна уу'],
    },
    number:{
        type: Number,
        required: [true, 'Хэрэглэгчийн утасны дугаарыг оруулна уу'],
        unique: true 
    },
    email:{
        type: String,
        required: [true, "Хэрэглэгчийн эмэйл хаягийг оруулна уу"],
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,"Зөв email хаяг оруулна уу"]
    },
    role:{
        type: String,
        required: [true, "хэрэглэгчийн эрхийг оруулна уу"],
        enum: ['user', 'admin'],
        default: "user"
    },
    password:{
        type: String,
        minLength: 4,
        required: [true, "Нууц үгээ оруулна уу"],
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

UserSchema.pre("save", async function(){
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.getJsonWebToken = function(){
    const token = jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIN
    })
    return token
}

UserSchema.methods.checkPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

UserSchema.statics.getJsonWebTokenStatic = function(userId) {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIN
    });
};
module.exports = mongoose.model("User", UserSchema)