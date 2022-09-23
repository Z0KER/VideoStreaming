const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Room = new Schema({
    name: {
        type: String,
        required: true
    }
})

mongoose.model('room', Room)