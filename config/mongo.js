const mongoose = require('mongoose')

module.exports = ConnectToMongo = async () => {
    try{
        await  mongoose.connect(process.env.MONGO_DB_URI)
        console.log('Connected to Mongo...')
    }catch(err){
        console.error(err)
    }
}