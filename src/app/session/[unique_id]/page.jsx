// 'use client'
// import { useEffect, useRef, useState } from 'react'
// import React from 'react'
// import axios from 'axios'
// import videojs from 'video.js'
// import 'video.js/dist/video-js.css'
// import '@videojs/themes/dist/city/index.css'
// import 'videojs-seek-buttons' // ✅ plugin

// export default function StudentSessionPage(props) {
//   const params = React.use(props.params) // ✅ unwrap params
//   const { unique_id } = params
//   const videoRef = useRef(null)
//   const playerRef = useRef(null)
//   const [session, setSession] = useState(null)
//   const [notFound, setNotFound] = useState(false)

//   useEffect(() => {
//     const fetchSession = async () => {
//       try {
//         const res = await axios.get(`/api/get-session/${unique_id}`) // ✅ Now works
//         if (res.data.success) {
//           setSession(res.data.session)
//         } else {
//           setNotFound(true)
//         }
//       } catch (err) {
//         setNotFound(true)
//       }
//     }
//     if (unique_id) fetchSession()
//   }, [unique_id]) // ✅ added dependency

//   useEffect(() => {
//     if (session && videoRef.current && !playerRef.current) {
//       playerRef.current = videojs(videoRef.current, {
//         controls: true,
//         fluid: true,
//         preload: 'auto',
//         playbackRates: [0.5, 1, 1.5, 2],
//       })
//       playerRef.current.seekButtons({
//         forward: 5,
//         back: 5,
//       })

//       // ✅ Add keyboard left/right skip support
//       const videoEl = playerRef.current.el()
//       videoEl.tabIndex = 1
//       videoEl.addEventListener('keydown', (e) => {
//         if (e.key === 'ArrowRight') {
//           playerRef.current.currentTime(playerRef.current.currentTime() + 5)
//         }
//         if (e.key === 'ArrowLeft') {
//           playerRef.current.currentTime(playerRef.current.currentTime() - 5)
//         }
//       })
//     }
//     return () => {
//       if (playerRef.current) {
//         playerRef.current.dispose()
//       }
//     }
//   }, [session])

//   if (notFound) {
//     return (
//       <h1 className='text-center mt-20 text-3xl font-bold text-red-500'>
//         ❌ Invalid or Expired Session
//       </h1>
//     )
//   }

//   if (!session) {
//     return <h2 className='text-center mt-20 text-xl'>Loading...</h2>
//   }

//   return (
//     <div className='p-10 text-center'>
//       <h1 className='text-3xl font-bold mb-6'>🎥 Live Session</h1>

//       <video
//         ref={videoRef}
//         className='video-js vjs-theme-city vjs-big-play-centered'
//       >
//         <source src='/sample1.mp4' type='video/mp4' />
//       </video>
//     </div>
//   )
// }

// 'use client'
// import { useEffect, useRef, useState } from 'react'
// import React from 'react'
// import axios from 'axios'
// import videojs from 'video.js'
// import 'video.js/dist/video-js.css'
// import '@videojs/themes/dist/city/index.css'

// export default function StudentSessionPage(props) {
//   const params = React.use(props.params)
//   const { unique_id } = params
//   const videoRef = useRef(null)
//   const playerRef = useRef(null)
//   const [session, setSession] = useState(null)
//   const [notFound, setNotFound] = useState(false)

//   useEffect(() => {
//     const fetchSession = async () => {
//       try {
//         const res = await axios.get(`/api/get-session/${unique_id}`)
//         if (res.data.success) setSession(res.data.session)
//         else setNotFound(true)
//       } catch {
//         setNotFound(true)
//       }
//     }
//     fetchSession()
//   }, [unique_id])

//   useEffect(() => {
//     if (!session || !videoRef.current || playerRef.current) return

//     const player = videojs(videoRef.current, {
//       controls: true,
//       fluid: true,
//       preload: 'auto',
//       playbackRates: [0.5, 1, 1.5, 2],
//     })

//     playerRef.current = player

//     const Button = videojs.getComponent('Button')

//     // ✅ Skip Backward Button
//     class SkipBackButton extends Button {
//       handleClick() {
//         player.currentTime(player.currentTime() - 5)
//       }
//       buildCSSClass() {
//         return 'vjs-control vjs-button skip-back'
//       }
//       createEl() {
//         return super.createEl(
//           'button',
//           {},
//           {
//             innerHTML: '<< 5s',
//           }
//         )
//       }
//     }

//     // ✅ Skip Forward Button
//     class SkipForwardButton extends Button {
//       handleClick() {
//         player.currentTime(player.currentTime() + 5)
//       }
//       buildCSSClass() {
//         return 'vjs-control vjs-button skip-forward'
//       }
//       createEl() {
//         return super.createEl(
//           'button',
//           {},
//           {
//             innerHTML: '5s >>',
//           }
//         )
//       }
//     }

//     videojs.registerComponent('SkipBackButton', SkipBackButton)
//     videojs.registerComponent('SkipForwardButton', SkipForwardButton)

//     const controlBar = player.getChild('controlBar')

//     // ✅ Insert skip buttons beside play button
//     controlBar.addChild('SkipBackButton', {}, 1)
//     controlBar.addChild('SkipForwardButton', {}, 3)

//     // ✅ Add keyboard left/right support
//     const videoEl = player.el()
//     videoEl.tabIndex = 1
//     videoEl.addEventListener('keydown', (e) => {
//       if (e.key === 'ArrowLeft') player.currentTime(player.currentTime() - 5)
//       if (e.key === 'ArrowRight') player.currentTime(player.currentTime() + 5)
//     })

//     return () => player.dispose()
//   }, [session])

//   if (notFound) {
//     return (
//       <h1 className='text-center mt-20 text-3xl font-bold text-red-500'>
//         ❌ Invalid or Expired Session
//       </h1>
//     )
//   }

//   if (!session) {
//     return <h2 className='text-center mt-20 text-xl'>Loading...</h2>
//   }

//   return (
//     <div className='p-10 text-center'>
//       <h1 className='text-3xl font-bold mb-6'>🎥 Live Session</h1>

//       <video
//         ref={videoRef}
//         className='video-js vjs-theme-city vjs-big-play-centered'
//       >
//         <source src='/sample1.mp4' type='video/mp4' />
//       </video>

//       <style>{`
//         .skip-back, .skip-forward {
//           font-size: 12px !important;
//           padding: 2px 6px !important;
//         }
//       `}</style>
//     </div>
//   )
// }
'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import dynamic from 'next/dynamic'
import 'plyr-react/plyr.css'

// ✅ Dynamic import of Plyr (client-side only)
const Plyr = dynamic(() => import('plyr-react'), { ssr: false })

export default function StudentSessionPage(props) {
  const params = React.use(props.params)
  const { unique_id } = params
  const [session, setSession] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const origin =
          typeof window !== 'undefined' ? window.location.origin : ''
        const res = await axios.get(`${origin}/api/get-session/${unique_id}`)
        if (res.data.success) setSession(res.data.session)
        else setNotFound(true)
      } catch {
        setNotFound(true)
      }
    }
    fetchSession()
  }, [unique_id])

  if (notFound) {
    return (
      <h1 className='text-center mt-20 text-3xl font-bold text-red-500 h-screen w-full flex items-center justify-center'>
        ❌ Invalid or Expired Session
      </h1>
    )
  }

  if (!session) {
    return (
      <h2 className='text-center mt-20 text-xl h-screen w-full flex items-center justify-center'>
        Loading...
      </h2>
    )
  }

  return (
    <div className='p-10 text-center'>
      <h1 className='text-3xl font-bold mb-6'>🎥 Live Session</h1>

      <div className='max-w-5xl mx-auto'>
        <Plyr
          source={{
            type: 'video',
            sources: [
              {
                src: `${
                  typeof window !== 'undefined' ? window.location.origin : ''
                }/sample1.mp4`,
                type: 'video/mp4',
              },
            ],
          }}
          options={{
            controls: [
              'play-large',
              'play',
              'progress',
              'current-time',
              'duration',
              'mute',
              'volume',
              'settings',
              'pip',
              'fullscreen',
            ],
            settings: ['quality', 'speed', 'pip'],
          }}
        />
      </div>
    </div>
  )
}
