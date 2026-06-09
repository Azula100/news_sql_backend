const mongoose = require('mongoose')
const CategorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true , 'Категорийн нэрийг оруулна уу'],
        unique: true, 
        trim: true,
        maxlength: [50, 'Категорийн нэрний урт 50 тэмдэгтээс хэтрэхгүй']
    },

    description:{
        type: String,
        required:[true , 'Категорийн тайлбарыг заавал оруулах ёстой'],
        maxlength: [500, 'Категорийн тайлбарын урт 500 тэмдэгтээс хэтрэхгүй']
    },

    photo:{
        type: String,
        default:'no-photo.jpg'
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})
module.exports  = mongoose.model("NewsCategory", CategorySchema)