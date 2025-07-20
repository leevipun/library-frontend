import mongoose from 'mongoose'

// you must install this library
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 4
    },
    born: {
        type: Number,
    },
})

schema.plugin(uniqueValidator)

export default mongoose.model('Author', schema)