// 'use client'
// import { useEffect, useRef } from 'react'
// import { io } from 'socket.io-client'

// export default function StudentSessionPage({ params }) {
//   const { unique_id } = params
//   const videoRef = useRef(null)
//   const pcRef = useRef(null)
//   const socketRef = useRef(null)

//   useEffect(() => {
//     const socket = io('http://localhost:1000')
//     socketRef.current = socket

//     const pc = new RTCPeerConnection()
//     pcRef.current = pc

//     // When remote stream is received
//     pc.ontrack = (event) => {
//       console.log('🎥 Remote stream received from admin')
//       videoRef.current.srcObject = event.streams[0]
//     }

//     // Handle ICE candidates
//     pc.onicecandidate = (event) => {
//       if (event.candidate)
//         socket.emit('candidate', {
//           candidate: event.candidate,
//           room: unique_id,
//         })
//     }

//     socket.emit('join-session', unique_id)
//     console.log('👤 Joined session room:', unique_id)

//     // Handle offer from admin
//     socket.on('offer', async (offer) => {
//       console.log('📩 Offer received from admin')
//       await pc.setRemoteDescription(offer)
//       const answer = await pc.createAnswer()
//       await pc.setLocalDescription(answer)
//       socket.emit('answer', { answer, room: unique_id })
//       console.log('📤 Answer sent to admin')
//     })

//     // Handle ICE candidates from admin
//     socket.on('candidate', async (candidate) => {
//       try {
//         if (candidate) await pc.addIceCandidate(candidate)
//       } catch (err) {
//         console.error('addIceCandidate error:', err)
//       }
//     })

//     return () => {
//       pc.close()
//       socket.disconnect()
//     }
//   }, [unique_id])

//   return (
//     <div className='p-10 text-center'>
//       <h1 className='text-3xl font-bold mb-6'>🎥 Live Session</h1>
//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         controls
//         className='w-[70%] mx-auto border rounded-lg shadow-lg'
//       />
//     </div>
//   )
// }
