import mongoose from 'mongoose'

const liveSessionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['admin', 'student'],
    },
    unique_id: {
      type: String,
      required: true,
    },
    userurl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

// Auto-increment logic (manually handling id number)
liveSessionSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastDoc = await this.constructor.findOne().sort({ id: -1 })
    this.id = lastDoc ? lastDoc.id + 1 : 1
  }
  next()
})

const LiveSession =
  mongoose.models.LiveSession ||
  mongoose.model('LiveSession', liveSessionSchema)

export default LiveSession
