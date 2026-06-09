const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Гарчгийг оруулна уу'], trim: true, maxlength: [200, 'Гарчиг 200 тэмдэгтээс хэтрэхгүй'] },
  content:     { type: String, required: [true, 'Агуулгыг оруулна уу'] },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'NewsCategory', required: [true, 'Категори заавал сонгоно уу'] },
  image:       { type: String, default: 'no-photo.jpg' },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views:       { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  slug:        { type: String, unique: true },
}, { timestamps: true });

NewsSchema.pre('save', async function() {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0400-\u04FF\s]/g, '')
      .replace(/\s+/g, '-')
      + '-' + Date.now();
  }
});

module.exports = mongoose.model('News', NewsSchema);