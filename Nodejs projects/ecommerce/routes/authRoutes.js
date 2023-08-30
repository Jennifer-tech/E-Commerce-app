const express = require('express');
const { createUser, 
    loginUserCtrl, 
    getallUser, 
    getauser, 
    deleteauser, 
    updateUser, 
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout
} = require('../controllers/userCtrl')
const { authMiddleware, isAdmin } = require ('../middlewares/authMiddleware')
const router = express.Router();

router.post('/register', createUser)
router.post('/login', loginUserCtrl)
router.get('/all-users', getallUser)
router.get('/refresh', handleRefreshToken)
router.get('/logout', logout)
router.get('/:id', authMiddleware, isAdmin, getauser)
router.delete('/:id', deleteauser)
router.patch('/edit-user', authMiddleware, updateUser)
router.patch('/block-user/:id', authMiddleware, isAdmin, blockUser)
router.patch('/unblock-user/:id', authMiddleware, isAdmin, unblockUser)

module.exports = router;