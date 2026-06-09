const express = require('express');
const router = express.Router();
const { login, register, getUsers, getUser,
        updateUser, deleteUser, logout } = require('../controller/userController');
const { protect, authorize } = require('../middleware/auth'); 

router.route('/login').post(login);       
router.route('/logout').post(logout);     
router.route('/register').post(register); 

router.route('/').get(protect, authorize('admin'), getUsers);

router.route('/:id')
    .get(protect, getUser)
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser)

module.exports = router;