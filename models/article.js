import { Schema, model } from 'mongoose'

const schema = new Schema({
  title: {
    type: String,
    required: [true, '文章標題必填']
  },
  content: {
    type: String,
    required: [true, '文章內容必填']
  },
  author: {
    type: String,
    required: [true, '文章作者必填']
  },
  url: {
    type: String,
    required: [true, '網址必填']
  },
  image: {
    type: String,
    required: [true, '文章圖片必填']
  }
}, {
  timestamps: true,
  versionKey: false
})

export default model('articles', schema)
