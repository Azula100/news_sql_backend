const NewsCategory = require('../models/Category')
const News  = require('../models/News')
const path = require('path')

exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await NewsCategory.find().sort({ createdAt: -1 })
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        })
    } catch (err) {
        res.status(400).json({ success: false, error: err.message })
    }
}

exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await NewsCategory.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ success: false, message: 'Категори олдсонгүй' })
        }
        res.status(200).json({ success: true, data: category })
    } catch (err) {
        res.status(400).json({ success: false, error: err.message })
    }
}

exports.createCategory = async (req, res, next) => {
    try {
        const existing = await NewsCategory.findOne({ name: req.body.name?.trim() })
        if (existing) {
            return res.status(400).json({ success: false, message: 'Энэ нэртэй категори аль хэдийн байна' })
        }

        let photo = 'no-photo.jpg'
        if (req.files && req.files.photo) {
            const file = req.files.photo
            const filename = 'cat-' + Date.now() + path.extname(file.name)
            const uploadPath = path.join(__dirname, '../data/uploads', filename)
            await file.mv(uploadPath)
            photo = `/uploads/${filename}`
        }

        const category = await NewsCategory.create(req.body)
        res.status(201).json({ success: true, data: category })
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message)
            return res.status(400).json({ success: false, message: messages.join(', ') })
        }
        res.status(400).json({ success: false, error: err.message })
    }
}

exports.updateCategory = async (req, res, next) => {
    try {
        const updates = { ...req.body }
        if (req.files && req.files.photo) {
            const file = req.files.photo
            const filename = 'cat-' + Date.now() + path.extname(file.name)
            const uploadPath = path.join(__dirname, '../data/uploads', filename)
            await file.mv(uploadPath)
            updates.photo = `/uploads/${filename}`
        }
        const category = await NewsCategory.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        )
        if (!category) {
            return res.status(404).json({ success: false, message: 'Категори олдсонгүй' })
        }
        res.status(200).json({ success: true, data: category })
    } catch (err) {
        res.status(400).json({ success: false, error: err.message })
    }
}

exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await NewsCategory.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ success: false, message: 'Категори олдсонгүй' })
        }
        const deleted = await News.deleteMany({ category: req.params.id })
        await category.deleteOne()
        res.status(200).json({
            success: true,
            message: `Категори болон ${deleted.deletedCount} мэдээ устгагдлаа`
        })
    } catch (err) {
        res.status(400).json({ success: false, error: err.message })
    }
}