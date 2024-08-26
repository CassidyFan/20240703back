import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import admin from '../middlewares/admin.js'
import { create, getAll, edit, get, getId, remove } from '../controllers/article.js'
import upload from '../middlewares/upload.js'

const router = Router()

// 新增文章，需驗證JWT及管理員權限，並且使用上傳中間件
router.post('/', auth.jwt, admin, upload, create)

// 獲取所有文章，不需驗證
router.get('/', get)

// 管理員獲取所有文章列表，需驗證JWT及管理員權限
router.get('/all', auth.jwt, admin, getAll)

// 獲取特定文章，不需驗證
router.get('/:id', getId)

// 編輯特定文章，需驗證JWT及管理員權限，並且使用上傳中間件
router.patch('/:id', auth.jwt, admin, upload, edit)

// 刪除特定文章，需驗證JWT及管理員權限
router.delete('/:id', auth.jwt, admin, remove)

export default router
