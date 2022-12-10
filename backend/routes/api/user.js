const express = require('express');
const router = express.Router();
const User = require('../../model/User');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');


router.post('/',
[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter your email').isEmail(),
    check('password', 'Please enter your password with 8 or more').isLength({
        min: 8,
    }),

], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const { name, email, password } = req.body;

    try{
        //유저가 존재하는지 부터 확인
        let user = await User.findOne({email});
        if(user) {
            return res.status(400).json({
                msg: 'User is already exist'
            })
        }
        //유저 아바타
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })
        user = new User({
            name,
            email,
            avatar,
            password
        })

        //패스워드 encrypt
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

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