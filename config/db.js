if(process.env.NODE_ENV == 'production') {
    module.exports = {mongoURI: 'mongodb+srv://zoker:oYt5uhgLhODRJtN8@videostreaming.ji2fqcy.mongodb.net/?retryWrites=true&w=majority'}
} else {
    module.exports = {mongoURI: 'mongodb://localhost/video-streaming'}
}