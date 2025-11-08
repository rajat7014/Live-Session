import next from 'next'
import { createServer } from 'http'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res))

  const io = new Server(server, {
    cors: { origin: '*' },
  })

  io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id)

    // Join session room
    socket.on('join-session', (unique_id) => {
      socket.join(unique_id)
      console.log(`👤 Socket ${socket.id} joined room: ${unique_id}`)

      // Notify admin that a student joined
      socket.to(unique_id).emit('student-joined', socket.id)
    })

    // Forward offer/answer/candidate to room
    socket.on('offer', ({ offer, room }) =>
      socket.to(room).emit('offer', offer)
    )
    socket.on('answer', ({ answer, room }) =>
      socket.to(room).emit('answer', answer)
    )
    socket.on('candidate', ({ candidate, room }) =>
      socket.to(room).emit('candidate', candidate)
    )

    socket.on('disconnect', () =>
      console.log('🔴 Client disconnected:', socket.id)
    )
  })

  const port = process.env.PORT || 1000
  server.listen(port, () =>
    console.log(`✅ Server running on http://localhost:${port}`)
  )
})
