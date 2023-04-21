const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generatemessage, genertaelocationmessage } = require('./utils/messages.js')
const { adduser, removeuser, getuser, getusersinroom } = require('./utils/users.js')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

const publicdirectorypath = path.join(__dirname, '../public')

app.use(express.static(publicdirectorypath))

io.on('connection', (socket)=>{
    console.log('New websocket connection')

    socket.on('join', ({ username, room }, callback)=>{
        const { Error, user } = adduser({ id: socket.id, username, room })

        if(Error){
            return callback(Error)
        }

        socket.join(user.room)

        socket.emit('message', generatemessage('ADMIN', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generatemessage('ADMIN', `${user.username} has joined!`))

        callback()

        io.to(user.room).emit('roomdata', {
            room: user.room,
            users: getusersinroom(user.room)
        })
    })

    socket.on('sendmessage', (message, callback)=>{
        const user = getuser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generatemessage(user.username, message))
        callback()
    })

    socket.on('sendlocation', (coords, callback)=>{
        const user = getuser(socket.id)
        io.to(user.room).emit('locationmessage', genertaelocationmessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeuser(socket.id)

        if(user){
            io.to(user.room).emit('message', generatemessage('ADMIN',`${user.username} has left!`))

            io.to(user.room).emit('roomdata', {
                room: user.room,
                users: getusersinroom(user.room)
            })
        }
    })
})

server.listen(port, ()=>{
    console.log(`Server is up and running on port ${port}!`)
})