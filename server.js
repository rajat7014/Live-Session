import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// ✅ Socket server logic
io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id)

  socket.on('join-session', (room) => {
    socket.join(room)
    console.log('👥 User joined room:', room)
  })

  socket.on('offer', ({ offer, room }) => {
    console.log(`📤 Offer received from admin for room: ${room}`)
    const clients = io.sockets.adapter.rooms.get(room)
    console.log('👥 Students currently in room:', clients ? clients.size : 0)
    socket.to(room).emit('offer', offer)
  })

  socket.on('answer', ({ answer, room }) => {
    console.log('📩 Answer received -> sending to admin')
    socket.to(room).emit('answer', answer)
  })

  socket.on('candidate', ({ candidate, room }) => {
    socket.to(room).emit('candidate', { candidate })
  })

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id)
  })
})

server.listen(1000, () =>
  console.log('🚀 Socket.io server running on port 1000')
)
