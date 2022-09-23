const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const room = require('./routes/room')
const db = require('./config/db')
require('./models/Room')
const Room = mongoose.model('room')
const fs = require('fs')
const upload = require('express-fileupload')

// Session
    app.use(session({
        secret: 'P4$6^h35YQ8z',
        resave: true,
        saveUninitialized: true
    }))

    app.use(flash())
    app.use(upload())

// Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null
        next()
    }) 

// Body Parser
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())

// Handlebars
    app.engine('handlebars', exphbs.engine())
    app.set('view engine', 'handlebars')

// Mongoose | Conectando com banco de dados
    mongoose.Promise = global.Promise
    mongoose.connect(db.mongoURI).then(() => {
        console.log('Connected to MongoDB')
    }).catch((err) => {
        console.log('Error connecting: ' + err)
    })

// Public
    app.use(express.static(path.join(__dirname, 'public')))

// Routes
    app.get('/', (req, res) => {
        res.render('index')
    })

    app.get("/video/:id", function (req, res) {
        // Verifica se há um intervalo fornecido para o vídeo
        const range = req.headers.range;
        if (!range) {
          res.status(400).send("Requires Range header");
        }
      
        // Pega stats do vídeo
        const videoPath = "routes/" + req.params.id + ".mp4";
        const videoSize = fs.statSync("routes/" + req.params.id + ".mp4").size;
      
        // Analisa intervalo
        const CHUNK_SIZE = 1 * 1e+6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
      
        // Cria headers
        const contentLength = end - start + 1;
        const headers = {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "video/mp4",
        };
      
        // Status HTTP 206 para Partial Content
        res.writeHead(206, headers);
      
        // cria um fluxo de leitura de vídeo para este chunk específico
        const videoStream = fs.createReadStream(videoPath, { start, end });
      
        // Transmite o trecho de vídeo para o cliente
        videoStream.pipe(res);
    })

    app.post('/', (req, res) => {
        let errors = []

        if(!req.body.name) {
            errors.push({text: 'Nome inválido!'})
        }

        if(errors.length > 0) {
            res.render('index', {errors: errors})
        } else {
            Room.findOne({name: req.body.name}).then((room) => {
                if(room) {
                    req.flash('error_msg', 'Esta sala já existe!')
                    res.redirect('/')
                }
                else {
                    const newRoom = new Room({
                        name: req.body.name
                    })
        
                    newRoom.save().then(() => {
                        Room.findOne({name: req.body.name}).then((room) => {
                            if(room) {
                                res.redirect('/room/' + room._id)
                            } else {
                                req.flash('error_msg', 'Erro interno')
                                res.redirect('/')
                            }
                        })
                    })
                }
            })
        }
    })

    app.use('/room', room)

    // Redirecionar para página inicial quando a rota não existir
        app.use(function(req, res, next) {
            res.redirect('/')
        })
    
// Others | Iniciando o servidor
    const PORT = process.env.PORT || 8080
    app.listen(PORT, () => {
        console.log('Server running!')
    })
