import mongoose from 'mongoose'

let isConnected = false

export default async function connectDB() {
  if (isConnected) return

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'live_session_db',
    })

    isConnected = true
    console.log('✅ MongoDB Connected')
  } catch (err) {
    console.log('❌ MongoDB Connection Error:', err)
  }
}
