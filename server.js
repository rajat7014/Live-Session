// server.js
import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// store last offer per room so late-joining students can get it
const activeOffers = {}

io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id)

  socket.on('join-session', (room) => {
    socket.join(room)
    console.log('👥 User joined room:', room)
  })

  socket.on('offer', ({ offer, room }) => {
    console.log(`📤 Offer received from admin for room: ${room}`)
    activeOffers[room] = offer // save it for late joins
    const clients = io.sockets.adapter.rooms.get(room)
    console.log('👥 Students currently in room:', clients ? clients.size : 0)
    // send to other clients in the room (not the sender)
    socket.broadcast.to(room).emit('offer', offer)
  })

  // student says they are ready; resend stored offer if present
  socket.on('student-ready', (room) => {
    console.log('🧑‍🎓 Student ready in room:', room)
    if (activeOffers[room]) {
      console.log('📤 Re-sending stored offer to ready student')
      socket.emit('offer', activeOffers[room])
    }
  })

  socket.on('answer', ({ answer, room }) => {
    console.log('📩 Answer received -> sending to admin')
    socket.broadcast.to(room).emit('answer', answer)
  })

  socket.on('candidate', ({ candidate, room }) => {
    socket.broadcast.to(room).emit('candidate', { candidate })
  })

  socket.onAny((event, ...args) => {
    // helpful debug: logs all events the server receives
    console.log('🔷 server event:', event, args)
  })

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id)
  })
})

server.listen(1000, () =>
  console.log('🚀 Socket.io server running on port 1000')
)
