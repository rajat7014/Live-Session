// 'use client'
// import React, { useEffect, useState, useRef } from 'react'
// import axios from 'axios'
// // import dynamic from 'next/dynamic'
// // import 'plyr-react/plyr.css'

// // // ✅ Dynamic import of Plyr (client-side only)
// // const Plyr = dynamic(() => import('plyr-react'), { ssr: false })

// export default function StudentSessionPage(props) {
//   const params = React.use(props.params)
//   const { unique_id } = params
//   const [session, setSession] = useState(null)
//   const [notFound, setNotFound] = useState(false)
//   const videoRef = useRef(null)

//   useEffect(() => {
//     const fetchSession = async () => {
//       try {
//         const origin =
//           typeof window !== 'undefined' ? window.location.origin : ''
//         const res = await axios.get(`${origin}/api/get-session/${unique_id}`)
//         if (res.data.success) setSession(res.data.session)
//         else setNotFound(true)
//       } catch {
//         setNotFound(true)
//       }
//     }
//     fetchSession()
//   }, [unique_id])

//   useEffect(() => {
//     if (!session) return

//     const socket = new WebSocket('ws://localhost:3000/api/socket')
//     const pc = new RTCPeerConnection()

//     // When remote stream arrives (from admin)
//     pc.ontrack = (event) => {
//       if (videoRef.current) {
//         videoRef.current.srcObject = event.streams[0]
//       }
//     }

//     socket.onopen = () =>
//       console.log('🟢 Student connected to signaling server')

//     socket.onmessage = async (event) => {
//       const data = JSON.parse(event.data)

//       if (data.offer) {
//         console.log('📩 Offer received from Admin')

//         await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
//         const answer = await pc.createAnswer()
//         await pc.setLocalDescription(answer)

//         socket.send(JSON.stringify({ answer }))
//         console.log('📤 Answer sent to Admin')
//       }

//       if (data.candidate) {
//         try {
//           await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
//         } catch (e) {
//           console.error('Error adding ICE candidate', e)
//         }
//       }
//     }
//   }, [session])

//   if (notFound) {
//     return (
//       <h1 className='text-center mt-20 text-3xl font-bold text-red-500 h-screen w-full flex items-center justify-center'>
//         ❌ Invalid or Expired Session
//       </h1>
//     )
//   }

//   if (!session) {
//     return (
//       <h2 className='text-center mt-20 text-xl h-screen w-full flex items-center justify-center'>
//         Loading...
//       </h2>
//     )
//   }

//   return (
//     <div className='p-10 text-center'>
//       <h1 className='text-3xl font-bold mb-6'>🎥 Live Session</h1>

//       <div className='max-w-5xl mx-auto'>
//         {/* <Plyr
//           source={{
//             type: 'video',
//             sources: [
//               {
//                 src: `${
//                   typeof window !== 'undefined' ? window.location.origin : ''
//                 }/sample1.mp4`,
//                 type: 'video/mp4',
//               },
//             ],
//           }}
//           options={{
//             controls: [
//               'play-large',
//               'play',
//               'progress',
//               'current-time',
//               'duration',
//               'mute',
//               'volume',
//               'settings',
//               'pip',
//               'fullscreen',
//             ],
//             settings: ['quality', 'speed', 'pip'],
//           }}
//         /> */}
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           className='border rounded-lg w-[70%] mx-auto shadow-lg'
//         ></video>
//       </div>
//     </div>
//   )
// }

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
'use client'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { use } from 'react'

export default function StudentSessionPage(props) {
  // Unwrap params Promise
  const params = use(props.params)
  const { unique_id } = params

  const videoRef = useRef(null)
  const pcRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = io('https://live-session-2.onrender.com')
    socketRef.current = socket

    const pc = new RTCPeerConnection()
    pcRef.current = pc

    // Join session room
    socket.emit('join-session', unique_id)
    console.log('👤 Joined session room:', unique_id)

    // Show admin's video when tracks arrive
    pc.ontrack = (event) => {
      console.log('🎥 Remote stream received from admin')
      videoRef.current.srcObject = event.streams[0]
    }

    // Handle offer from admin
    socket.on('offer', async (offer) => {
      console.log('📩 Offer received from admin')
      try {
        await pc.setRemoteDescription(offer)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('answer', { answer, room: unique_id })
        console.log('📤 Answer sent to admin')
      } catch (err) {
        console.error('Offer handling error:', err)
      }
    })

    // Handle ICE candidate from admin
    socket.on('candidate', async (candidate) => {
      try {
        if (candidate) await pc.addIceCandidate(candidate)
      } catch (err) {
        console.error('addIceCandidate error:', err)
      }
    })

    // Send ICE candidates to admin
    pc.onicecandidate = (event) => {
      if (event.candidate)
        socket.emit('candidate', {
          candidate: event.candidate,
          room: unique_id,
        })
    }

    return () => {
      pc.close()
      socket.disconnect()
    }
  }, [unique_id])

  return (
    <div className='p-10 text-center'>
      <h1 className='text-3xl font-bold mb-6'>🎥 Live Session</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className='w-[70%] mx-auto border rounded-lg shadow-lg'
      />
    </div>
  )
}
