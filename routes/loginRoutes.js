const express = require('express')
const router = express.Router()

const {registerUser, userLogin, logout, refreshToken, authenticateToken,authorLogin, adminLogin } = require('../controllers/loginControllers')

router.post('/userRegister', registerUser);

router.post('/userlogin', userLogin);

router.post('/logout', logout);

router.post('/refresh-token', refreshToken);

router.post('/verify-token', authenticateToken, (req, res) => {
    res.json({ valid: true });
});

router.post('/authorLogin', authorLogin);

router.post('/adminLogin', adminLogin);


module.exports = router






