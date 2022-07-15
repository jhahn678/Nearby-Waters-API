const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const app = express()
const PORT = process.env.PORT || 3500

require('dotenv').config()
require('./config/mongo')()

app.use(cors())
app.use(express.json())

app.use('/near', routes)
app.get('/', (req, res) => {
    res.status(200).json('This is the Nearby Waters API')
})

app.use('*', (err, req, res, next) => {
    console.error(err)
    return res.status(400).json({ error: err.message || 'Uncaught server error' })
})

app.use('*', (req, res) => {
    res.status(404).json('Invalid route')
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
