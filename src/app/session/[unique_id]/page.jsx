// 'use client'
// import { useEffect, useRef, useState } from 'react'
// import React from 'react'
// import axios from 'axios'
// import { io } from 'socket.io-client'

// export default function StudentSessionPage(props) {
//   const params = React.use(props.params)
//   const { unique_id } = params
//   const [session, setSession] = useState(null)
//   const [notFound, setNotFound] = useState(false)
//   const videoRef = useRef(null)

// useEffect(() => {
//   const fetchSession = async () => {
//     try {
//       const origin =
//         typeof window !== 'undefined' ? window.location.origin : ''
//       const res = await axios.get(`${origin}/api/get-session/${unique_id}`)
//       if (res.data.success) setSession(res.data.session)
//       else setNotFound(true)
//     } catch {
//       setNotFound(true)
//     }
//   }
//   fetchSession()
// }, [unique_id])

//   useEffect(() => {
//     if (!session) return
//     const socket = io()
//     const pc = new RTCPeerConnection()

//     pc.ontrack = (event) => {
//       if (videoRef.current) videoRef.current.srcObject = event.streams[0]
//     }

//     pc.onicecandidate = (event) => {
//       if (event.candidate) socket.emit('candidate', event.candidate)
//     }

//     socket.on('offer', async (offer) => {
//       await pc.setRemoteDescription(new RTCSessionDescription(offer))
//       const answer = await pc.createAnswer()
//       await pc.setLocalDescription(answer)
//       socket.emit('answer', answer)
//     })

//     socket.on('candidate', async (candidate) => {
//       await pc.addIceCandidate(new RTCIceCandidate(candidate))
//     })
//   }, [session])

//   if (notFound)
//     return (
//       <h1 className='text-red-500 text-center mt-20 text-3xl'>
//         ❌ Invalid or Expired Session
//       </h1>
//     )

//   if (!session) return <h2 className='text-center mt-20 text-xl'>Loading...</h2>

//   return (
//     <div className='p-10 text-center'>
//       <h1 className='text-3xl font-bold mb-6'>🎥 Live Session</h1>
//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         className='w-[70%] mx-auto border rounded-lg'
//       />
//     </div>
//   )
// }

// import StudentSessionClient from './StudentSessionClient'

// export default function Page({ params }) {
//   return <StudentSessionClient unique_id={params.unique_id} />
// }
// 'use client'
// import { useEffect, useRef } from 'react'
// import { io } from 'socket.io-client'
// import { useParams } from 'next/navigation'

// export default function StudentSessionPage() {
//   const { unique_id } = useParams()
//   const videoRef = useRef(null)
//   const pcRef = useRef(null)
//   const socketRef = useRef(null)

//   useEffect(() => {
//     if (!unique_id) {
//       console.error('❌ unique_id missing in route')
//       return
//     }

//     console.log('👤 Joined session room:', unique_id)
//     const socket = io('http://localhost:1000')
//     socketRef.current = socket

//     socket.emit('join-session', unique_id)
//     socket.on('connect', () => {
//       console.log('🟢 Student connected to signaling server:', socket.id)
//     })

//     const pc = new RTCPeerConnection()
//     pcRef.current = pc

//     pc.ontrack = (event) => {
//       console.log('📺 Remote stream received by student')
//       videoRef.current.srcObject = event.streams[0]
//     }

//     // ✅ Listen for offer event correctly
//     socket.on('offer', async (offer) => {
//       console.log('📤 Offer received from admin')
//       await pc.setRemoteDescription(new RTCSessionDescription(offer))
//       const answer = await pc.createAnswer()
//       await pc.setLocalDescription(answer)
//       socket.emit('answer', { answer, room })
//     })

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit('candidate', { candidate: event.candidate, unique_id })
//       }
//     }

//     socket.on('candidate', async ({ candidate }) => {
//       if (candidate) {
//         try {
//           await pc.addIceCandidate(new RTCIceCandidate(candidate))
//         } catch (err) {
//           console.error('❌ Error adding ICE candidate:', err)
//         }
//       }
//     })

//     return () => {
//       socket.disconnect()
//       pc.close()
//     }
//   }, [unique_id])

//   return (
//     <div className='p-10 flex justify-center items-center h-screen'>
//       <div>
//         <h2 className='text-2xl mb-4'>🎓 Student Live Session</h2>
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           className='w-[640px] h-[480px] bg-black rounded-lg'
//         />
//       </div>
//     </div>
//   )
// }

'use client'
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useParams } from 'next/navigation'

export default function StudentSessionPage() {
  const { unique_id } = useParams()
  const videoRef = useRef(null)
  const pcRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!unique_id) {
      console.error('❌ unique_id missing in route')
      return
    }

    console.log('👤 Joined session room:', unique_id)

    // fresh socket instance and force websocket transport
    const socket = io('http://localhost:1000', {
      forceNew: true,
      transports: ['websocket'],
    })
    socketRef.current = socket

    // debug all incoming events
    socket.onAny((event, ...args) =>
      console.log('📡 Socket Event:', event, args)
    )

    socket.on('connect', () => {
      console.log('🟢 Student connected to signaling server:', socket.id)
      socket.emit('join-session', unique_id)
      // let server know student is ready to receive any stored offer
      socket.emit('student-ready', unique_id)
    })

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    pcRef.current = pc

    pc.ontrack = (event) => {
      console.log(
        '📺 Remote stream received by student, streams:',
        event.streams
      )
      if (videoRef.current) videoRef.current.srcObject = event.streams[0]
    }

    // when student receives an offer
    socket.on('offer', async (offer) => {
      try {
        console.log('📩 Offer received from admin')
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        // send back the student's answer (use pc.localDescription)
        socket.emit('answer', { answer: pc.localDescription, room: unique_id })
        console.log('📤 Answer sent to admin')
      } catch (err) {
        console.error('Error handling offer on student:', err)
      }
    })

    // send student ICE candidates to server
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', {
          candidate: event.candidate,
          room: unique_id,
        })
      }
    }

    // receive candidate from admin
    socket.on('candidate', async ({ candidate }) => {
      if (!candidate) return
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.error('❌ Error adding ICE candidate (student):', err)
      }
    })

    return () => {
      socket.disconnect()
      pc.close()
    }
  }, [unique_id])

  return (
    <div className='p-10 flex justify-center items-center h-screen'>
      <div>
        <h2 className='text-2xl mb-4'>🎓 Student Live Session</h2>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className='w-[640px] h-[480px] bg-black rounded-lg'
        />
      </div>
    </div>
  )
}
