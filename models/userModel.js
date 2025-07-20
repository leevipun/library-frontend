import mongoose from 'mongoose'

// you must install this library
import uniqueValidator from 'mongoose-unique-validator'

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 5
    },
    password: {
        type: String,
    },
    favoriteGenre: {
        type: String,
    }
})

schema.plugin(uniqueValidator)

export default mongoose.model('User', schema)