const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, ovog, number, email, password, role } = req.body

    // Имэйл давхардсан эсэх шалгах
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Энэ имэйлээр бүртгэлтэй хэрэглэгч байна' })
    }

    // Утасны дугаар давхардсан эсэх
    const existingNumber = await User.findOne({ number })
    if (existingNumber) {
      return res.status(400).json({ success: false, message: 'Энэ утасны дугаар бүртгэлтэй байна' })
    }

    const user = await User.create({ name, ovog, number, email, password, role: role || 'user' })
    const token = user.getJsonWebToken()

    const cookieOption = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true
    }

    res.status(201).cookie('book-token', token, cookieOption).json({
      success: true,
      token,
      data: user
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message)
      return res.status(400).json({ success: false, message: messages.join(', ') })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}
// @POST /api/auth/login
exports.login = async(req, res, next) => {
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({ success: false, error: "Имэйл, нууц үг дамжуулна уу" })
        }

        const myUser = await User.findOne({email}).select("+password")
        if(!myUser){
            return res.status(404).json({ success: false, error: "Имэйлээ зөв оруулна уу" })
        }

        const pass = await myUser.checkPassword(password)
        if(!pass){
            return res.status(401).json({ success: false, error: "Нууц үг буруу байна" })
        }

        const token = myUser.getJsonWebToken()
        const cookieOption = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true  
        }

        res.status(200).cookie("book-token", token, cookieOption).json({
            success: true,
            token: token,
            data: myUser
        })
    }
    catch(err){
        res.status(400).json({ success: false, error: err.message })
    }
}

exports.logout = async (req, res, next) => {
    try{
       const cookieOption = {
        expires: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        httpOnly : true
       }
       res.status(200).cookie('book-token', null, cookieOption).json({
        success: true,
        data: 'logged out....'
       })
    }
    catch (err){
        res.status(400).json({
            success:false,
            error:err.message
        })
    }
}

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User олдсонгүй"
            })
        }

        res.status(200).json({
            success: true,
            data: user
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User олдсонгүй"
            })
        }

        res.status(200).json({
            success: true,
            data: user
        })

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        })
    }
}

exports.deleteUser = async(req, res, next) => {
    try{
        const myUser = await User.findByIdAndDelete(req.params.id)
        res.status(200).json({
            success:true,
            data:myUser
        })
    }
    catch (err){
        console.error(err)
        res.status(400).json({
            success:false,
            error: err.message
        })
    }
}