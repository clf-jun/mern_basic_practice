const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../model/User');

const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwrod');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');

    }
});


router.post('/',
[
    check('email', 'Please enter your email').isEmail(),
    check('password', 'Please enter your password with 8 or more').exists()

], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const { email, password } = req.body;

    try{
        //유저가 없다면 메시지
        let user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({
                msg: 'User is not exist'
            })
        }

        //비번 일치하는지 비교
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({
                msg: 'passwrod is wrong or user is not exist'
            })
        }

        //jsonWebToken - 클라이언트와 서버 사이에 정보 공유시 사용되는 토큰
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if(err) throw err;
                res.json({
                    token
                })
            })
            console.log(token);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
});


module.exports = router;