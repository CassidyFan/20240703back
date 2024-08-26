import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import admin from '../middlewares/admin.js'
import { create, getAll, edit, get, getId, remove } from '../controllers/board.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', auth.jwt, admin, upload, create)
router.get('/', get)
router.get('/all', auth.jwt, admin, getAll)
router.get('/:id', getId)
router.patch('/:id', auth.jwt, admin, upload, edit)
router.delete('/:id', auth.jwt, admin, remove)
// router.patch('/:id/like', auth.jwt, likeBoard)
// router.patch('/:id/unlike', auth.jwt, unlikeBoard)
export default router
