const express = require('express')
const config = require('config')
const path = require('path')
const mongoose = require('mongoose')

const app = express()
const PORT = config.get('port') || 5000

app.use(express.json({extended: true}))
app.use('/api/auth', require('./routs/auth.routs'))
app.use('/api/link', require('./routs/link.routs'))
app.use('/t', require('./routs/redirect.routs'))

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, 'client', 'build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

async function start() {
    try {
        await mongoose.connect(config.get('mongoUrl'), {})
        app.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}...`);
        })
    } catch (err) {
        console.log('Server error: ', err.message);
        process.exit(1)
    }
}
start()
