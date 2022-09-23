const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Room')
const Room = mongoose.model('room')
require('../models/Video')
const Video = mongoose.model('video')
const fs = require('fs')

router.get('/', (req, res) => {
    res.redirect('/')
})

router.get('/:id', (req, res) => {
    Room.findOne({_id: req.params.id}).lean().then((room) => {
        if(room) {
            Video.findOne({title: req.params.id}).then((video) => {
                res.render('room', {room: room, video: video})
            })
        } else {
            res.redirect('/')
        }
        
    }).catch((err) => {
        res.redirect('/')
    })
})

router.get('/delete/:id', (req, res) => {
    Room.deleteOne({_id: req.params.id}).then(() => {
        fs.unlinkSync(__dirname + '/../public/video/' + req.params.id + '.mp4')
        req.flash('success_msg', 'Sessão encerrada com sucesso!')
        res.redirect('/')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao tentar encerrar a sessão!')
        res.redirect('/room/' + req.params.id)
    })
})

router.post('/insert-video', (req, res) => {
    if(req.files) {
        let file = req.files.file
        let filename = req.body.title
        file.mv('./uploads/' + filename + '.mp4', (err) => {
            if(err) {
                req.flash('error_msg', 'Erro ao fazer upload! ' + err)
                res.redirect('/room/' + req.body.title)
            } else {
                Video.findOne({title: req.body.title}).then((video) => {
                    const newVideo = new Video({
                        title: req.body.title
                    })
        
                    newVideo.save().then(() => {
                        res.redirect('/room/' + req.body.title)
                    }).catch((err) => {
                        req.flash('error_msg', 'Erro ao tentar inserir video!')
                        res.redirect('/room/' + req.body.title)
                    })  
                }).catch((err) => {
                    req.flash('error_msg', 'Erro interno!')
                    res.redirect('/')
                })
            }
        })
    }
    
})


module.exports = router