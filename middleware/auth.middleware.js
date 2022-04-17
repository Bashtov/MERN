const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1] // "Bearer TOKeN"

        if (!token) {
            return res.status(401).json({message: 'No authorization'})
        }

        const decoded = jwt.verify(token, config.get('jwtSecretKey'))
        req.user = decoded
        next()

    } catch (err) {
        return res.status(401).json({message: 'No authorization'})
    }
}