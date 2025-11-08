// 'use client'
// import { useEffect, useRef, useState } from 'react'
// import axios from 'axios'

// export default function StartSessionPage() {
//   const [session, setSession] = useState(null)
//   const [peer, setPeer] = useState(null)
//   const [ws, setWs] = useState(null)
//   const videoRef = useRef(null)

//   const handleStartSession = async () => {
//     const res = await axios.post('/api/create-session')
//     setSession(res.data.session)
//   }

//   useEffect(() => {
//     if (!session) return

//     const socket = new WebSocket('ws://localhost:3000/api/socket')
//     const pc = new RTCPeerConnection()

//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         if (videoRef.current) videoRef.current.srcObject = stream
//         stream.getTracks().forEach((track) => pc.addTrack(track, stream))
//       })

//     socket.onopen = () => console.log('🟢 Admin connected to signaling server')

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.send(JSON.stringify({ candidate: event.candidate }))
//       }
//     }

//     socket.onmessage = async (event) => {
//       const data = JSON.parse(event.data)
//       if (data.answer) {
//         await pc.setRemoteDescription(new RTCSessionDescription(data.answer))
//         console.log('📩 Answer received from Student')
//       }
//     }

//     pc.createOffer()
//       .then((offer) => pc.setLocalDescription(offer))
//       .then(() => socket.send(JSON.stringify({ offer: pc.localDescription })))
//   }, [session])

//   const origin = typeof window !== 'undefined' ? window.location.origin : ''
//   const sessionUrl = session ? `${origin}/session/${session.unique_id}` : ''

//   return (
// <div className='p-10 text-center h-screen w-full flex items-center justify-center'>
//   {!session ? (
//     <button
//       onClick={handleStartSession}
//       className='px-6 py-3 bg-blue-600 text-white text-lg rounded cursor-pointer hover:bg-blue-700'
//     >
//       START SESSION
//         </button>
//       ) : (
//         <div>
//           <h2 className='text-2xl font-bold mb-3'>✅ Session Started</h2>

//           <p className='mb-2'>
//             Share this link with student:
//             <br />
//             <a
//               href={sessionUrl}
//               target='_blank'
//               className='text-blue-500 underline break-all'
//             >
//               {sessionUrl}
//             </a>
//           </p>
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             muted
//             className='border rounded-lg w-[70%] mx-auto shadow-lg'
//           ></video>
//         </div>
//       )}
//     </div>
//   )
// }

'use client'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

export default function StartSessionPage() {
  const [session, setSession] = useState(null)
  const videoRef = useRef(null)

  const handleStartSession = async () => {
    const res = await axios.post('/api/create-session')
    setSession(res.data.session)
  }

  useEffect(() => {
    if (!session) return
    const socket = io()

    const pc = new RTCPeerConnection()
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      })

    pc.onicecandidate = (event) => {
      if (event.candidate) socket.emit('candidate', event.candidate)
    }

    socket.on('answer', async (answer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
    })

    socket.on('candidate', async (candidate) => {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    })

    pc.createOffer().then(async (offer) => {
      await pc.setLocalDescription(offer)
      socket.emit('offer', offer)
    })
  }, [session])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const sessionUrl = session ? `${origin}/session/${session.unique_id}` : ''

  return (
    <div className='p-10 text-center h-screen w-full flex items-center justify-center'>
      {!session ? (
        <button
          onClick={handleStartSession}
          className='px-6 py-3 bg-blue-600 text-white text-lg rounded cursor-pointer  hover:bg-blue-700 transition-all '
        >
          START SESSION
        </button>
      ) : (
        <div>
          <h2 className='text-2xl font-bold mb-3 '>✅ Session Started</h2>
          <p className='mt-2 text-gray-200'>
            Share this link with the student:
          </p>

          {/* ✅ Link opens in a new tab */}
          <a
            href={sessionUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-400 underline hover:text-blue-600 transition-all mt-2 block'
          >
            {sessionUrl}
          </a>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className='mt-4 w-[100%] mx-auto rounded-lg border shadow-lg'
          />
        </div>
      )}
    </div>
  )
}
