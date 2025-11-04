import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import LiveSession from '@/app/models/LiveSession'

export async function GET(req, context) {
  try {
    await connectDB()

    // ✅ params is async in Next.js 16
    const { unique_id } = await context.params

    const session = await LiveSession.findOne({ unique_id })

    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Session not found',
      })
    }

    return NextResponse.json({
      success: true,
      session,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
