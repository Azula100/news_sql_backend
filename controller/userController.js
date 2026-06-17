const prisma = require('../config/prisma')
const bcrypt = require('bcrypt')
const jwt    = require('jsonwebtoken')

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRESIN || '90d' })

const cookieOption = {
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  httpOnly: true
}

// @POST /api/auth/ — Бүртгэх
exports.register = async (req, res) => {
  try {
    const { name, ovog, number, email, password, role } = req.body

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { number: Number(number) }] }
    })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Имэйл эсвэл утасны дугаар бүртгэлтэй байна' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user   = await prisma.user.create({
      data: { name, ovog, number: Number(number), email, password: hashed, role: role || 'user' }
    })

    const token = generateToken(user.id)
    const { password: _, ...safeUser } = user

    res.status(201).cookie('book-token', token, cookieOption).json({ success: true, token, data: safeUser })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @POST /api/auth/login — Нэвтрэх
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ success: false, message: 'Имэйл эсвэл нууц үг буруу' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ success: false, message: 'Имэйл эсвэл нууц үг буруу' })

    const token = generateToken(user.id)
    const { password: _, ...safeUser } = user

    res.cookie('book-token', token, cookieOption).json({ success: true, token, data: safeUser })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie('book-token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true })
  res.json({ success: true, message: 'Гарлаа' })
}

// @GET /api/auth — Бүх хэрэглэгч
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id:true, name:true, ovog:true, email:true, role:true, createdAt:true } })
    res.json({ success: true, count: users.length, data: users })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/auth/:id
exports.getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id:true, name:true, ovog:true, email:true, role:true, createdAt:true }
    })
    if (!user) return res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй' })
    res.json({ success: true, data: user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @PUT /api/auth/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, ovog, number, email, role } = req.body
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, ovog, number: Number(number), email, role },
      select: { id:true, name:true, ovog:true, email:true, role:true }
    })
    res.json({ success: true, data: user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @DELETE /api/auth/:id
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Хэрэглэгч устгагдлаа' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
