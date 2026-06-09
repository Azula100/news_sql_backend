const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const connectDB = require('./config/db')

dotenv.config({ path:'./config/config.env'})
connectDB()

const app = express()
const fileupload = require('express-fileupload')
const uploadDir = path.join(__dirname, 'data/uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

app.use(fileupload())
app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')))

app.use('/api/auth', require('./routes/userRoute'))
app.use('/api/news', require('./routes/newsRoute'))
app.use('/api/categories', require('./routes/categoryRoute'))

app.get('/', (req, res) => res.json({ message: '📰 News API ажиллаж байна!' }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`))