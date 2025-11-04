import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import LiveSession from '@/app/models/LiveSession'
import { v4 as uuidv4 } from 'uuid'

export async function POST() {
  try {
    await connectDB()

    const uniqueId = uuidv4()
    const userurl = `${process.env.NEXT_PUBLIC_BASE_URL}/session/${uniqueId}`

    const newSession = await LiveSession.create({
      type: 'admin',
      unique_id: uniqueId,
      userurl,
    })

    return NextResponse.json({ success: true, session: newSession })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
