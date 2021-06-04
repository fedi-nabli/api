import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import {notFound, errorHandler} from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import courseRoutes from './routes/courseRoutes.js'

dotenv.config()
connectDB()
const app = express()
app.use(express.json())

app.use('/api/courses', courseRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/uploads', uploadRoutes)

const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.send('API is running')
  })
}

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENv} nmode on port ${PORT}`.yellow.bold))
