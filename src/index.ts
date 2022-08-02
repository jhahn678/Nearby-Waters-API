const express = require('express')
import { Application } from 'express'
import MongoDB from './config/mongo'
import cors from 'cors'
import routes from './routes'

const app: Application = express()
const PORT = process.env.PORT || 3500

require('dotenv').config()
MongoDB()

app.use(cors())
app.use(express.json())

app.use('/', routes)

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
