'use client'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

export default function StartSessionPage() {
  const [session, setSession] = useState(null)
  const videoRef = useRef(null)
  const pcRef = useRef(null)
  const socketRef = useRef(null)

  const handleStartSession = async () => {
    const res = await axios.post('/api/create-session')
    const newSession = res.data.session
    setSession(newSession)
  }

  useEffect(() => {
    if (!session) return

    const socket = io('https://live-session-2.onrender.com')
    socketRef.current = socket

    const pc = new RTCPeerConnection()
    pcRef.current = pc

    // Get admin webcam and add tracks
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      })
      .catch((err) => console.error('Camera access error:', err))

    // Send ICE candidates to students
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', {
          candidate: event.candidate,
          room: session.unique_id,
        })
      }
    }

    // Wait for student to join before sending offer
    socket.on('student-joined', async (studentSocketId) => {
      console.log('👤 Student joined:', studentSocketId)
      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('offer', { offer, room: session.unique_id })
        console.log('📤 Offer sent to student')
      } catch (err) {
        console.error('Offer creation error:', err)
      }
    })

    // Receive answer from student
    socket.on('answer', async ({ answer }) => {
      console.log('📩 Received answer from student')
      try {
        await pc.setRemoteDescription(answer)
      } catch (err) {
        console.error('setRemoteDescription error:', err)
      }
    })

    // Receive ICE candidate from student
    socket.on('candidate', async ({ candidate }) => {
      try {
        if (candidate) await pc.addIceCandidate(candidate)
      } catch (err) {
        console.error('addIceCandidate error:', err)
      }
    })

    // Join admin to room
    socket.emit('join-session', session.unique_id)

    return () => {
      pc.close()
      socket.disconnect()
    }
  }, [session])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const sessionUrl = session ? `${origin}/session/${session.unique_id}` : ''

  return (
    <div className='p-10 text-center h-screen flex items-center justify-center'>
      {!session ? (
        <button
          onClick={handleStartSession}
          className='px-6 py-3 bg-blue-600 text-white text-lg rounded hover:bg-blue-700 transition-all'
        >
          START SESSION
        </button>
      ) : (
        <div>
          <h2 className='text-2xl font-bold mb-3'>✅ Session Started</h2>
          <p className='text-gray-300'>Share this link with student:</p>
          <a
            href={sessionUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-400 underline mt-2 block'
          >
            {sessionUrl}
          </a>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className='mt-4 w-[90%] mx-auto rounded-lg border shadow-lg'
          />
        </div>
      )}
    </div>
  )
}
