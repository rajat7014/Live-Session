// 'use client'
// import { useRef, useState } from 'react'
// import { io } from 'socket.io-client'
// import axios from 'axios'

// export default function StartSessionPage() {
//   const [session, setSession] = useState(null)
//   const [isStreaming, setIsStreaming] = useState(false)
//   const videoRef = useRef(null)
//   const pcRef = useRef(null)
//   const socketRef = useRef(null)

//   const handleStartSession = async () => {
//     try {
//       const res = await axios.post('/api/create-session')
//       const session = res.data?.session
//       if (!session?.unique_id) {
//         console.error('❌ No session or unique_id returned', res.data)
//         return
//       }

//       setSession(session)
//       const unique_id = session.unique_id
//       console.log('🎬 Joined session room:', unique_id)

//       // Force a fresh socket instance for this tab
//       const socket = io('http://localhost:1000', {
//         forceNew: true,
//         transports: ['websocket'],
//       })
//       socketRef.current = socket

//       socket.on('connect', () => {
//         console.log('🟢 Admin connected to signaling server:', socket.id)
//         socket.emit('join-session', unique_id)
//       })

//       // store peer
//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//       })
//       pcRef.current = pc

//       // get webcam + mic
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       })
//       // attach local preview
//       if (videoRef.current) videoRef.current.srcObject = stream
//       // add tracks to peer
//       stream.getTracks().forEach((track) => pc.addTrack(track, stream))

//       // send ICE candidates to server
//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit('candidate', {
//             candidate: event.candidate,
//             room: unique_id,
//           })
//         }
//       }

//       // listen for candidate from student
//       socket.on('candidate', async ({ candidate }) => {
//         if (candidate) {
//           try {
//             await pc.addIceCandidate(new RTCIceCandidate(candidate))
//           } catch (err) {
//             console.error('Admin addIceCandidate error:', err)
//           }
//         }
//       })

//       // listen for answer from student
//       socket.on('answer', async (answer) => {
//         console.log('📩 Answer received from student')
//         try {
//           await pc.setRemoteDescription(new RTCSessionDescription(answer))
//         } catch (err) {
//           console.error('Error setting remote description (admin):', err)
//         }
//       })

//       // Wait briefly so students who open immediately can join, then create & send offer
//       setTimeout(async () => {
//         try {
//           const offer = await pc.createOffer()
//           await pc.setLocalDescription(offer)
//           socket.emit('offer', { offer: pc.localDescription, room: unique_id })
//           console.log('📤 Offer sent to student')
//         } catch (err) {
//           console.error('Error creating/sending offer:', err)
//         }
//       }, 1000)
//     } catch (err) {
//       console.error('Error starting session:', err)
//     }
//   }

//   return (
//     <div className='p-10 text-center bg-gray-900 text-white min-h-screen'>
//       <h1 className='text-3xl font-bold mb-6'>🎥 Start Live Session</h1>

//       {!session ? (
//         <button
//           onClick={handleStartSession}
//           className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition'
//         >
//           Start Session
//         </button>
//       ) : (
//         <div>
//           <p className='text-green-400 mb-4 font-semibold'>
//             ✅ Session Created Successfully
//           </p>
//           <p className='text-sm mb-4'>
//             Share this link with student:
//             <br />
//             <span className='text-blue-400 underline'>{session.userurl}</span>
//           </p>

//           {/* 🎛️ Video Player with Full Controls */}
//           <div className='relative inline-block'>
//             <video
//               ref={videoRef}
//               autoPlay
//               muted
//               playsInline
//               controls // ✅ Adds video player controls
//               className='w-[720px] h-[480px] mx-auto border-2 border-gray-700 rounded-xl shadow-lg bg-black'
//             />
//             {isStreaming && (
//               <div className='absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full animate-pulse'>
//                 🔴 LIVE
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

'use client'
import { useRef, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'

export default function StartSessionPage() {
  const [session, setSession] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const videoRef = useRef(null)
  const pcRef = useRef(null)
  const socketRef = useRef(null)

  const handleStartSession = async () => {
    try {
      const res = await axios.post('/api/create-session')
      const session = res.data?.session
      if (!session?.unique_id) {
        console.error('❌ No session or unique_id returned', res.data)
        return
      }

      setSession(session)
      const unique_id = session.unique_id
      console.log('🎬 Joined session room:', unique_id)

      const socket = io('http://localhost:1000', {
        forceNew: true,
        transports: ['websocket'],
      })
      socketRef.current = socket

      socket.on('connect', () => {
        console.log('🟢 Admin connected to signaling server:', socket.id)
        socket.emit('join-session', unique_id)
      })

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })
      pcRef.current = pc

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('candidate', {
            candidate: event.candidate,
            room: unique_id,
          })
        }
      }

      socket.on('candidate', async ({ candidate }) => {
        if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (err) {
            console.error('Admin addIceCandidate error:', err)
          }
        }
      })

      socket.on('answer', async (answer) => {
        console.log('📩 Answer received from student')
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
        } catch (err) {
          console.error('Error setting remote description (admin):', err)
        }
      })

      // Create and send offer after short delay
      setTimeout(async () => {
        try {
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          socket.emit('offer', { offer: pc.localDescription, room: unique_id })
          console.log('📤 Offer sent to student')
        } catch (err) {
          console.error('Error creating/sending offer:', err)
        }
      }, 1000)
    } catch (err) {
      console.error('Error starting session:', err)
    }
  }

  return (
    <div className='p-10 text-center bg-gray-900 text-white min-h-screen'>
      <h1 className='text-3xl font-bold mb-6'>🎥 Start Live Session</h1>

      {!session ? (
        <button
          onClick={handleStartSession}
          className='bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition'
        >
          Start Session
        </button>
      ) : (
        <div>
          <p className='text-green-400 mb-4 font-semibold'>
            ✅ Session Created
          </p>
          <p className='text-sm mb-4'>
            Share this link with student:
            <br />
            <span className='text-blue-400 underline'>{session.userurl}</span>
          </p>

          {/* 🎛️ Video Player with Full Controls */}
          <div className='relative inline-block'>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              controls // ✅ Adds video player controls
              className='w-[720px] h-[480px] mx-auto border-2 border-gray-700 rounded-xl shadow-lg bg-black'
            />
            {isStreaming && (
              <div className='absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full animate-pulse'>
                🔴 LIVE
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
