const express = require('express')
const router = express.Router()

const userController = require('../../controllers/user-controller')
const upload = require('../../middleware/multer')

router.get('/:id/editUser', userController.getEditUser)
router.put('/:id/editUser', upload.single('avatar'), userController.editUser)
router.post('/:id/applyLandlord', upload.single('avatar'), userController.postApplyLandlord)
router.get('/:id', userController.getUser)

module.exports = router
