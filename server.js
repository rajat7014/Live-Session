// server.js
import next from 'next'
import { createServer } from 'http'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res))
  const io = new Server(server, { cors: { origin: '*' } })

  io.on('connection', (socket) => {
    console.log('🟢 New client connected')

    socket.on('offer', (offer) => socket.broadcast.emit('offer', offer))
    socket.on('answer', (answer) => socket.broadcast.emit('answer', answer))
    socket.on('candidate', (candidate) =>
      socket.broadcast.emit('candidate', candidate)
    )

    socket.on('disconnect', () => console.log('🔴 Client disconnected'))
  })

  const port = 3000
  server.listen(port, () =>
    console.log(`✅ Server running on http://localhost:${port}`)
  )
})
