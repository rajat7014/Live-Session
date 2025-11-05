'use client'
import { useState } from 'react'
import axios from 'axios'

export default function StartSessionPage() {
  const [session, setSession] = useState(null)

  const handleStartSession = async () => {
    const res = await axios.post('/api/create-session')
    setSession(res.data.session)
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const sessionUrl = session ? `${origin}/session/${session.unique_id}` : ''

  return (
    <div className='p-10 text-center h-screen w-full flex items-center justify-center'>
      {!session ? (
        <button
          onClick={handleStartSession}
          className='px-6 py-3 bg-blue-600 text-white text-lg rounded cursor-pointer hover:bg-blue-700'
        >
          START SESSION
        </button>
      ) : (
        <div>
          <h2 className='text-2xl font-bold mb-3'>✅ Session Started</h2>

          <p className='mb-2'>Share this link with student:</p>

          <a
            href={sessionUrl}
            target='_blank'
            className='text-blue-500 underline break-all'
          >
            {sessionUrl}
          </a>

          <video
            controls
            className='w-full max-w-2xl mx-auto mt-6 border rounded-lg'
            src='/sample1.mp4'
          ></video>
        </div>
      )}
    </div>
  )
}
