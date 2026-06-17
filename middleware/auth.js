const jwt   = require('jsonwebtoken')
const prisma = require('../config/prisma')

exports.protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies?.['book-token']) {
    token = req.cookies['book-token']
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Нэвтрэх шаардлагатай' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Хэрэглэгч олдсонгүй' })
    }
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token хүчингүй байна' })
  }
}

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Хандах эрх байхгүй' })
    }
    next()
  }
}
