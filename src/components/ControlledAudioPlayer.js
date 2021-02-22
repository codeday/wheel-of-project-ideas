import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import ReactAudioPlayer from 'react-audio-player'

export default function ControlledAudioPlayer({
  playing,
  src,
}) {
  const playerRef = useRef()

  useEffect(() => {
    if (playing) {
      playerRef.current.audioEl.current.play()
    } else {
      playerRef.current.audioEl.current.pause()
    }
  }, [playing])

  return (
    <ReactAudioPlayer
      ref={playerRef}
      autoPlay={playing}
      src={src}
    />
  )
}
