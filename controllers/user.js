import User from '../models/user.js'
import Product from '../models/product.js'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import validator from 'validator'

export const create = async (req, res) => {
  try {
    await User.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '帳號已註冊'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const login = async (req, res) => {
  try {
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens.push(token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        token,
        account: req.user.account,
        email: req.user.email,
        role: req.user.role,
        cart: req.user.cartQuantity,
        age: req.user.age,
        job: req.user.job,
        phone: req.user.phone,
        address: req.user.address,
        gender: req.user.gender
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const extend = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex(token => token === req.token)
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens[idx] = token
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: token
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const profile = (req, res) => {
  try {
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        account: req.user.account,
        email: req.user.email,
        role: req.user.role,
        cart: req.user.cartQuantity,
        age: req.user.age,
        job: req.user.job,
        address: req.user.address,
        phone: req.user.phone,
        gender: req.user.gender
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token !== req.token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const editCart = async (req, res) => {
  try {
    if (!validator.isMongoId(req.body.product)) throw new Error('ID')

    const idx = req.user.cart.findIndex(item => item.p_id.toString() === req.body.product)
    if (idx > -1) {
      // 購物車內有這個商品，檢查修改後的數量
      const quantity = req.user.cart[idx].quantity + parseInt(req.body.quantity)
      if (quantity <= 0) {
        // 修改後小於等於 0，刪除
        req.user.cart.splice(idx, 1)
      } else {
        // 修改後還有，修改
        req.user.cart[idx].quantity = quantity
      }
    } else {
      // 購物車內沒這個商品，檢查商品是否存在
      const product = await Product.findById(req.body.product).orFail(new Error('NOT FOUND'))
      if (!product.sell) throw new Error('SELL')

      req.user.cart.push({
        p_id: product._id,
        quantity: req.body.quantity
      })
    }

    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: req.user.cartQuantity
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '商品 ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無商品'
      })
    } else if (error.message === 'SELL') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '商品已下架'
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

export const getCart = async (req, res) => {
  try {
    const result = await User.findById(req.user._id, 'cart').populate('cart.p_id')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: result.cart
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body
    // 過濾不允許更新的欄位
    const allowedUpdates = ['name', 'email', 'age', 'job', 'gender', 'phone', 'address'] // 根據需求調整允許更新的欄位
    const keys = Object.keys(updates)

    const isValidOperation = keys.every(key => allowedUpdates.includes(key))
    if (!isValidOperation) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '不允許的更新欄位'
      })
    }

    // 如果有更新密碼，進行加密
    // if (updates.password) {
    //   if (updates.password.length < 4 || updates.password.length > 20) {
    //     return res.status(StatusCodes.BAD_REQUEST).json({
    //       success: false,
    //       message: '使用者密碼長度不符'
    //     })
    //   }
    //   updates.password = bcrypt.hashSync(updates.password, 10)
    // }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password -tokens')
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到使用者'
      })
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        account: user.account,
        email: user.email,
        role: user.role,
        cart: user.cartQuantity,
        age: user.age,
        job: user.job,
        gender: user.gender,
        address: user.address,
        phone: user.phone
      }
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
