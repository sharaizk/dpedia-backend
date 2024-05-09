const mongoose = require('mongoose')

const studentSchema = mongoose.Schema({
    interest: {
        type:String
    },
    freeQuestion: {
        type:String
    },
    createdAt: {
        type:String
    }
}, { timestamps: true })

module.exports=mongoose.model('student',studentSchema)

