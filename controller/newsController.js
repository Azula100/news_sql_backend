const prisma     = require('../config/prisma')
const cloudinary = require('../config/cloudinary')

const uploadToCloudinary = async (file, folder) => {
  const b64     = file.data.toString('base64')
  const dataUri = `data:${file.mimetype};base64,${b64}`
  const result  = await cloudinary.uploader.upload(dataUri, { folder })
  return result.secure_url
}

// @GET /api/news
exports.getAllNews = async (req, res) => {
  try {
    const { category, page = 1, limit = 9, search } = req.query
    const where = { isPublished: true }

    if (category && category !== 'Бүгд') {
      const cat = await prisma.newsCategory.findUnique({ where: { name: category } })
      if (cat) where.categoryId = cat.id
      else return res.json({ success:true, data:[], total:0, pages:0, currentPage:1 })
    }

    if (search) where.title = { contains: search, mode: 'insensitive' }

    const total = await prisma.news.count({ where })
    const news  = await prisma.news.findMany({
      where,
      include: {
        author:   { select: { id:true, name:true, email:true } },
        category: { select: { id:true, name:true, photo:true } }
      },
      orderBy: { createdAt: 'desc' },
      skip:  (Number(page) - 1) * Number(limit),
      take:  Number(limit)
    })

    res.json({ success:true, data:news, total, pages: Math.ceil(total/limit), currentPage: Number(page) })
  } catch (err) {
    res.status(500).json({ success:false, message: err.message })
  }
}

// @GET /api/news/:id
exports.getNewsById = async (req, res) => {
  try {
    const news = await prisma.news.findUnique({
      where: { id: req.params.id },
      include: {
        author:   { select: { id:true, name:true, email:true } },
        category: { select: { id:true, name:true, photo:true, description:true } }
      }
    })
    if (!news) return res.status(404).json({ success:false, message:'Мэдээ олдсонгүй' })

    await prisma.news.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } })
    res.json({ success:true, data: news })
  } catch (err) {
    res.status(500).json({ success:false, message: err.message })
  }
}

// @POST /api/news
exports.createNews = async (req, res) => {
  try {
    const { title, content, category } = req.body

    const cat = await prisma.newsCategory.findUnique({ where: { id: category } })
    if (!cat) return res.status(400).json({ success:false, message:'Категори олдсонгүй' })

    let image = 'no-photo.jpg'
    if (req.files?.image) {
      image = await uploadToCloudinary(req.files.image, 'news')
    }

    // Slug үүсгэх
    const slug = title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()

    const news = await prisma.news.create({
      data: { title, content, image, slug, authorId: req.user.id, categoryId: category },
      include: {
        author:   { select: { id:true, name:true, email:true } },
        category: { select: { id:true, name:true, photo:true } }
      }
    })

    res.status(201).json({ success:true, data: news })
  } catch (err) {
    res.status(500).json({ success:false, message: err.message })
  }
}

// @PUT /api/news/:id
exports.updateNews = async (req, res) => {
  try {
    const news = await prisma.news.findUnique({ where: { id: req.params.id } })
    if (!news) return res.status(404).json({ success:false, message:'Мэдээ олдсонгүй' })

    if (news.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success:false, message:'Хандах эрх байхгүй' })
    }

    const { title, content, category } = req.body
    const data = {}

    if (title)    data.title    = title
    if (content)  data.content  = content
    if (category) data.categoryId = category

    if (req.files?.image) {
      data.image = await uploadToCloudinary(req.files.image, 'news')
    }

    const updated = await prisma.news.update({
      where: { id: req.params.id },
      data,
      include: {
        author:   { select: { id:true, name:true, email:true } },
        category: { select: { id:true, name:true, photo:true } }
      }
    })

    res.json({ success:true, data: updated })
  } catch (err) {
    res.status(500).json({ success:false, message: err.message })
  }
}

// @DELETE /api/news/:id
exports.deleteNews = async (req, res) => {
  try {
    const news = await prisma.news.findUnique({ where: { id: req.params.id } })
    if (!news) return res.status(404).json({ success:false, message:'Мэдээ олдсонгүй' })

    if (news.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success:false, message:'Хандах эрх байхгүй' })
    }

    await prisma.news.delete({ where: { id: req.params.id } })
    res.json({ success:true, message:'Мэдээ устгагдлаа' })
  } catch (err) {
    res.status(500).json({ success:false, message: err.message })
  }
}
