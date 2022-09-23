const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Video = new Schema({
    title: {
        type: String,
        required: true
    }
})

mongoose.model('video', Video)