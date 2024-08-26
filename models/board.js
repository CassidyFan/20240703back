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
<<<<<<< HEAD
  // likes: {
  //   type: Number,
  //   default: 0 // 設定預設喜歡數為 0
  // }
=======
>>>>>>> 4bbaaf36b9c63d0b13ac6cd30610ce42c599477e
}, {
  timestamps: true,
  versionKey: false
})

export default model('boards', schema)
