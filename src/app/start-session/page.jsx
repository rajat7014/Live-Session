// 'use client'
// import { useRef, useState } from 'react'
// import { io } from 'socket.io-client'
// import axios from 'axios'

// export default function StartSessionPage() {
//   const [session, setSession] = useState(null)
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

//       const socket = io('http://localhost:1000')
//       socketRef.current = socket
//       socket.emit('join-session', unique_id)

//       const pc = new RTCPeerConnection()
//       pcRef.current = pc

//       // ✅ Capture webcam
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       })
//       stream.getTracks().forEach((track) => pc.addTrack(track, stream))
//       videoRef.current.srcObject = stream

//       // ✅ ICE candidate handling
//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit('candidate', {
//             candidate: event.candidate,
//             room: unique_id,
//           })
//         }
//       }

//       // ✅ Create & send Offer
//       // ✅ Create & send Offer after short delay
//       setTimeout(async () => {
//         const offer = await pc.createOffer()
//         await pc.setLocalDescription(offer)
//         socket.emit('offer', { offer, room: unique_id })
//         console.log('📤 Offer sent to student')
//       }, 5000)

//       // ✅ Handle student Answer
//       socket.on('answer', async (answer) => {
//         console.log('📩 Answer received from student')
//         await pc.setRemoteDescription(answer)
//       })

//       // ✅ Handle student's ICE candidates
//       socket.on('candidate', async (candidate) => {
//         if (candidate) await pc.addIceCandidate(candidate)
//       })
//     } catch (err) {
//       console.error('Error starting session:', err)
//     }
//   }

//   return (
//     <div className='p-10 text-center'>
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
//           <p className='text-green-600 mb-4'>✅ Session Created</p>
//           <p className='text-sm mb-2'>
//             Student URL:{' '}
//             <span className='text-blue-600 font-semibold'>
//               {session.userurl}
//             </span>
//           </p>
//           <video
//             ref={videoRef}
//             autoPlay
//             muted
//             playsInline
//             className='w-[70%] mx-auto border rounded-lg shadow-lg'
//           />
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

      // ✅ Always create a new socket instance
      const socket = io('http://localhost:1000', { forceNew: true })
      socketRef.current = socket
      socket.emit('join-session', unique_id)

      // ✅ Setup WebRTC
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      // Capture webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      videoRef.current.srcObject = stream

      // Send ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('candidate', {
            candidate: event.candidate,
            room: unique_id,
          })
        }
      }

      // Create & send Offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('offer', { offer, room: unique_id })
      console.log('📤 Offer sent to student')

      // Receive Answer
      socket.on('answer', async (answer) => {
        console.log('📩 Answer received from student')
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      })

      // Receive ICE candidates from student
      socket.on('candidate', async ({ candidate }) => {
        if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate))
      })
    } catch (err) {
      console.error('Error starting session:', err)
    }
  }

  return (
    <div className='p-10 text-center'>
      <h1 className='text-3xl font-bold mb-6'>🎥 Start Live Session</h1>

      {!session ? (
        <button
          onClick={handleStartSession}
          className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition'
        >
          Start Session
        </button>
      ) : (
        <div>
          <p className='text-green-600 mb-4'>✅ Session Created</p>
          <p className='text-sm mb-2'>
            Student URL:{' '}
            <span className='text-blue-600 font-semibold'>
              {session.userurl}
            </span>
          </p>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className='w-[70%] mx-auto border rounded-lg shadow-lg'
          />
        </div>
      )}
    </div>
  )
}
