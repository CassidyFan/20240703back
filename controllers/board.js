import Board from '../models/board.js'
import { StatusCodes } from 'http-status-codes'
import validator from 'validator'

export const create = async (req, res) => {
  try {
    req.body.image = req.file.path
    const result = await Board.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '公告創建成功',
      result
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const getAll = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'createdAt'
    const sortOrder = req.query.sortOrder || 'desc'
    const itemsPerPage = req.query.itemsPerPage * 1 || 15
    const page = req.query.page * 1 || 1
    const regex = new RegExp(req.query.search || '', 'i')

    const data = await Board
      .find({
        $or: [
          { name: regex },
          { description: regex }
        ]
      })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    const total = await Board.estimatedDocumentCount()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        data, total
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const edit = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID 格式錯誤')

    req.body.image = req.file?.path
    await Board.findByIdAndUpdate(req.params.id, req.body, { runValidators: true }).orFail(new Error('NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '公告編輯成功'
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID 格式錯誤') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '公告 ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無公告'
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const get = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'createdAt'
    const sortOrder = req.query.sortOrder || 'desc'
    const itemsPerPage = req.query.itemsPerPage * 1 || 15
    const page = req.query.page * 1 || 1
    const regex = new RegExp(req.query.search || '', 'i')

    const data = await Board
      .find({
        $or: [
          { name: regex },
          { description: regex }
        ]
      })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    const total = await Board.countDocuments()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        data, total
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const getId = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID 格式錯誤')

    const result = await Board.findById(req.params.id).orFail(new Error('NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID 格式錯誤') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '公告 ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無公告'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const remove = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID 格式錯誤')

    await Board.findByIdAndDelete(req.params.id).orFail(new Error('NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '板塊刪除成功'
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID 格式錯誤') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '板塊 ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無板塊'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

// export const likeBoard = async (req, res) => {
//   try {
//     if (!validator.isMongoId(req.params.id)) throw new Error('ID 格式錯誤')

//     const board = await Board.findById(req.params.id).orFail(new Error('NOT FOUND'))

//     board.likes = (board.likes || 0) + 1
//     await board.save()

//     res.status(StatusCodes.OK).json({
//       success: true,
//       message: '成功增加喜歡',
//       likes: board.likes
//     })
//   } catch (error) {
//     if (error.name === 'CastError' || error.message === 'ID 格式錯誤') {
//       res.status(StatusCodes.BAD_REQUEST).json({
//         success: false,
//         message: '板塊 ID 格式錯誤'
//       })
//     } else if (error.message === 'NOT FOUND') {
//       res.status(StatusCodes.NOT_FOUND).json({
//         success: false,
//         message: '查無板塊'
//       })
//     } else {
//       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: '未知錯誤'
//       })
//     }
//   }
// }

// export const unlikeBoard = async (req, res) => {
//   try {
//     if (!validator.isMongoId(req.params.id)) throw new Error('ID 格式錯誤')

//     const board = await Board.findById(req.params.id).orFail(new Error('NOT FOUND'))

//     board.likes = Math.max((board.likes || 0) - 1, 0)
//     await board.save()

//     res.status(StatusCodes.OK).json({
//       success: true,
//       message: '成功取消喜歡',
//       likes: board.likes
//     })
//   } catch (error) {
//     if (error.name === 'CastError' || error.message === 'ID 格式錯誤') {
//       res.status(StatusCodes.BAD_REQUEST).json({
//         success: false,
//         message: '板塊 ID 格式錯誤'
//       })
//     } else if (error.message === 'NOT FOUND') {
//       res.status(StatusCodes.NOT_FOUND).json({
//         success: false,
//         message: '查無板塊'
//       })
//     } else {
//       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: '未知錯誤'
//       })
//     }
//   }
// }
