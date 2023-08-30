const express = require('express')
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const app = express();
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 4000
const authRouter = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
dbConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/api/user', authRouter)

// the error is to be handled after the route
app.use(notFound);
app.use(errorHandler)
app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`)
})