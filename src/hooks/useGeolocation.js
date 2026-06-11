import { useState, useEffect, useRef } from 'preact/hooks'

export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [watching, setWatching] = useState(false)
  const watchIdRef = useRef(null)

  const start = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this device.')
      return
    }

    setError(null)
    setWatching(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (watchIdRef.current === null) return
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy, // metres
          timestamp: pos.timestamp,
        })
      },
      (err) => {
        setError(err.message)
        setWatching(false)
      },
      {
        enableHighAccuracy: true,  // forces GPS over Wi-Fi/cell
        maximumAge: 0,             // never use a cached position
        timeout: 10000,
      }
    )
  }

  const stop = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setWatching(false)
    setPosition(null)
  }

  useEffect(() => () => stop(), [])

  return { position, error, watching, start, stop }
}
