const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// Нэвтэрсэн эсэх шалгах
exports.protect = async (req, res, next) => {
    console.log('protect дуудагдлаа')        // ✅ нэмэх
    console.log('next төрөл:', typeof next) 
    let token

    // Header-с token авах
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    // Cookie-с token авах (login cookie-тай ирсэн бол)
    else if (req.cookies?.['book-token']) {
        token = req.cookies['book-token']
    }
    console.log('token:', token)  // ✅ нэмэх
    if (!token) {
        return res.status(401).json({ success: false, message: 'Нэвтрэх шаардлагатай' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log('decoded:', decoded) 
        req.user = await User.findById(decoded.id)
        console.log('req.user:', req.user)
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Хэрэглэгч олдсонгүй' })
        }
        next()
    } catch (err) {
        console.log('catch алдаа:', err.message)
        return res.status(401).json({ success: false, message: 'Token хүчингүй байна' })
    }
}

exports.authorize = (...roles) => {
    console.log('authorize дуудагдлаа, roles:', roles)  // ✅ нэмэх
    return (req, res, next) => {
        console.log('authorize inner, next төрөл:', typeof next)  // ✅ нэмэх
        console.log('req.user.role:', req.user?.role)              // ✅ нэмэх
        
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Нэвтрэх шаардлагатай' })
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `"${req.user.role}" эрхтэй хэрэглэгч хандах боломжгүй`
            })
        }
        next()
    }
}
