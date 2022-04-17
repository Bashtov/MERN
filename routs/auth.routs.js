const {Router} = require('express')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs') //хэширование паролей
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()

// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Incorrect email').isEmail(),
        check('password', 'Min size 6 symbols').isLength({min: 6})
    ], 
    async (req, res) => {
    try {
        console.log('Body', req.body);
        
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: 'Incorrect registration data'
            })
        }

        const {email, password} = req.body
        const candidate = await User.findOne({ email: email})

        if (candidate){
            return res.status(400).json({message: 'Not unique user'})
        }
        
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({email: email, password: hashedPassword})

        await user.save()
        res.status(201).json({message: 'User was create'})

    } catch (err) {
        res.status(500).json({message: 'Something went wrong'})
    }
})

// /api/auth/login
router.post(
    '/login', 
    [
        check('email', 'Enter email').normalizeEmail().isEmail(),
        check('password', 'Enter password').exists()
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req)

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: 'Incorrect login data'
            })
        }

        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: 'User not found'})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message: 'Invalid password'})
        }

        const token = jwt.sign(
            {userId: user.id},
            config.get('jwtSecretKey'),
            {expiresIn: '1h'}
        )

        res.json({token, userId: user.id})
        

    } catch (err) {
        res.status(500).json({message: 'Something went wrong'})
    }
    
})

module.exports = router