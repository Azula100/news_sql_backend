const News     = require('../models/News')
const Category = require('../models/Category')
const path = require('path')

exports.getAllNews = async (req, res) => {
    try {
        const { category, page = 1, limit = 9, search } = req.query
        const query = { isPublished: true }
        if (category && category !== 'Бүгд') {
            const cat = await Category.findOne({ name: category })
            if (cat) query.category = cat._id
            else return res.json({ success: true, data: [], total: 0, pages: 0, currentPage: 1 })
        }

        if (search) query.title = { $regex: search, $options: 'i' }

        const total = await News.countDocuments(query)
        const news  = await News.find(query)
            .populate('author',   'name email role')
            .populate('category', 'name photo')       
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))

        res.json({
            success: true,
            data: news,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page)
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

exports.getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
            .populate('author',   'name email role')
            .populate('category', 'name photo description') 

        if (!news) return res.status(404).json({ success: false, message: 'Мэдээ олдсонгүй' })

        await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })

        res.json({ success: true, data: news })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

exports.createNews = async (req, res) => {
    try {
        const { title, content, category } = req.body
        const cat = await Category.findById(category)
        if (!cat) {
            return res.status(400).json({ success: false, message: 'Категори олдсонгүй' })
        }
        let image = 'no-photo.jpg'
        if (req.files && req.files.image) {
            const file = req.files.image
            const filename = Date.now() + path.extname(file.name)
            const uploadPath = path.join(__dirname, '../data/uploads', filename)
            await file.mv(uploadPath)          
            image = `/uploads/${filename}`
        }
        const news = await News.create({
            title, content, category, image,
            author: req.user._id
        })
        await news.populate([
            { path: 'author',   select: 'name email' },
            { path: 'category', select: 'name photo' }
        ])
        res.status(201).json({ success: true, data: news })
    } catch (err) {
        console.log('Алдааны нэр:', err.name)      
        console.log('Алдааны код:', err.code)      
        console.log('Алдааны мэдээлэл:', err)      
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Ийм гарчигтай мэдээ аль хэдийн байна' })
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(', ') })
        }
        res.status(500).json({ success: false, message: err.message })
    }
}

exports.updateNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
        if (!news) return res.status(404).json({ success: false, message: 'Мэдээ олдсонгүй' })
        if (news.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Хандах эрх байхгүй' })
        }
        const updates = { ...req.body }
        if (req.files && req.files.image) {
            const file = req.files.image
            const filename = Date.now() + path.extname(file.name)
            const uploadPath = path.join(__dirname, '../data/uploads', filename)
            await file.mv(uploadPath)
            updates.image = `/uploads/${filename}`
        }
        const updated = await News.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
            .populate('author',   'name email')
            .populate('category', 'name photo')

        res.json({ success: true, data: updated })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

exports.deleteNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
        if (!news) return res.status(404).json({ success: false, message: 'Мэдээ олдсонгүй' })
        if (news.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Хандах эрх байхгүй' })
        }
        await news.deleteOne()
        res.json({ success: true, message: 'Мэдээ амжилттай устгагдлаа' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}