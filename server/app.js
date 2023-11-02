const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const cors = require('cors')


const app = express()



app.use(cors({
    origin: '*',
    methods: ['GET', 'PUT', 'DELETE', 'PATCH', 'POST'],
    allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept'
}))


app.use(logger('dev'))

app.use(express.json())


const productRoutes = require('./routes/product')

const userRoutes = require('./routes/users')


app.use('/api/products', productRoutes)

app.use('/api/users', userRoutes)



module.exports = app