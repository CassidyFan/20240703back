import { Schema, model } from 'mongoose'

const schema = new Schema({
  name: {
    type: String,
    required: [true, '看板名稱必填']
  },
  description: {
    type: String,
    required: [true, '看板描述必填']
  },
  image: {
    type: String,
    required: [true, '看板圖片必填']
  }
}, {
  timestamps: true,
  versionKey: false
})

export default model('boards', schema)
