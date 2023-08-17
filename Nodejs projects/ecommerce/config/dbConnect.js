const { default: mongoose } = require('mongoose');

const dbConnect = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URI_OFFLINE);
        console.log('Database connected successfully')
    } catch (error) {
        console.log('Database error')
    }
}

module.exports = dbConnect;