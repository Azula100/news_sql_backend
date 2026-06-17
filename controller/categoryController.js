const prisma     = require('../config/prisma')
const cloudinary = require('../config/cloudinary')

const uploadToCloudinary = async (file, folder) => {
  const b64     = file.data.toString('base64')
  const dataUri = `data:${file.mimetype};base64,${b64}`
  const result  = await cloudinary.uploader.upload(dataUri, { folder })
  return result.secure_url
}

// @GET /api/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.newsCategory.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { news: true } } }
    })
    res.json({ success:true, count: categories.length, data: categories })
  } catch (err) {
    res.status(500).json({ success:false, error: err.message })
  }
}

// @GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await prisma.newsCategory.findUnique({ where: { id: req.params.id } })
    if (!category) return res.status(404).json({ success:false, message:'Категори олдсонгүй' })
    res.json({ success:true, data: category })
  } catch (err) {
    res.status(500).json({ success:false, error: err.message })
  }
}

// @POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const existing = await prisma.newsCategory.findUnique({ where: { name: req.body.name?.trim() } })
    if (existing) return res.status(400).json({ success:false, message:'Энэ нэртэй категори аль хэдийн байна' })

    let photo = 'no-photo.jpg'
    if (req.files?.photo) {
      photo = await uploadToCloudinary(req.files.photo, 'categories')
    }

    const category = await prisma.newsCategory.create({
      data: { name: req.body.name?.trim(), description: req.body.description || '', photo }
    })
    res.status(201).json({ success:true, data: category })
  } catch (err) {
    res.status(500).json({ success:false, error: err.message })
  }
}

// @PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const data = { ...req.body }
    if (req.files?.photo) {
      data.photo = await uploadToCloudinary(req.files.photo, 'categories')
    }

    const category = await prisma.newsCategory.update({ where: { id: req.params.id }, data })
    res.json({ success:true, data: category })
  } catch (err) {
    res.status(500).json({ success:false, error: err.message })
  }
}

// @DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    // Холбоотой мэдээг эхлээд устгана
    const deleted = await prisma.news.deleteMany({ where: { categoryId: req.params.id } })
    await prisma.newsCategory.delete({ where: { id: req.params.id } })
    res.json({ success:true, message:`Категори болон ${deleted.count} мэдээ устгагдлаа` })
  } catch (err) {
    res.status(500).json({ success:false, error: err.message })
  }
}
