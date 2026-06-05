const mongoose = require('mongoose')

const cropsSchema = new mongoose.Schema({
    cropsName: {
        type: String
    }

})

const cropsModel =  mongoose.model('crops', cropsSchema)

module.exports = cropsModel