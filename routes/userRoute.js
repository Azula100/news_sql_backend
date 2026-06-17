const express = require('express')
const router  = express.Router()
const { register, login, logout, getUsers, getUser, updateUser, deleteUser } = require('../controller/userController')
const { protect } = require('../middleware/auth')

router.post('/login', login)
router.get('/logout', logout)
router.route('/').post(register).get(protect, getUsers)
router.route('/:id').get(protect, getUser).put(protect, updateUser).delete(protect, deleteUser)

module.exports = router
