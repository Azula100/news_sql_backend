const express = require('express')
const router = express.Router()
const path = require('path')
const {
    getAllNews, getNewsById, createNews, updateNews, deleteNews, uploadNewsPhoto
} = require('../controller/newsController')
const { protect, authorize } = require('../middleware/auth')

router.get('/',    getAllNews)
router.get('/:id', getNewsById)
router.post('/',   protect, authorize('user', 'editor', 'admin'), createNews)
router.put('/:id', protect, updateNews)
router.delete('/:id', protect, deleteNews)
module.exports = router
