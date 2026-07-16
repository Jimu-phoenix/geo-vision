import { useState, useEffect, useRef } from 'preact/hooks'
import Router, { route } from 'preact-router'
import { Landing } from './components/Landing'
import { TrackPage } from './pages/TrackPage'
import { MeasurePage } from './pages/MeasurePage'
import { useGeolocation } from './hooks/useGeolocation'
import { useTracker } from './hooks/useTracker'
import { broadcastPosition, removeDevice } from './services/locationService'

export function App() {
  const [identity, setIdentity] = useState(() => {
    const saved = localStorage.getItem('trackr_identity')
    return saved ? JSON.parse(saved) : null
  })
  const identityRef = useRef(identity)
  identityRef.current = identity

  const { position, error: geoError, watching, start, stop } = useGeolocation()
  const stopRef = useRef(stop)
  stopRef.current = stop

  const { devices, loading, error: dbError, removeFromList } = useTracker(identity?.groupId)

  const handleSetup = (id) => {
    localStorage.setItem('trackr_identity', JSON.stringify(id))
    setIdentity(id)
    route('/track')
  }

  const handleStop = async () => {
    stop()
    if (identity) {
      await removeDevice(identity.deviceId, identity.groupId).catch(console.error)
      removeFromList(identity.deviceId)
    }
  }

  const handleClearIdentity = async () => {
    if (watching) stop()
    if (identity) {
      await removeDevice(identity.deviceId, identity.groupId).catch(console.error)
    }
    localStorage.removeItem('trackr_identity')
    setIdentity(null)
    route('/')
  }

  // Broadcast position to Supabase when watching
  useEffect(() => {
    if (!position || !identity || !watching) return
    broadcastPosition({
      deviceId: identity.deviceId,
      groupId: identity.groupId,
      label: identity.label,
      ...position,
    }).catch((err) => console.error('Broadcast error:', err))
  }, [position, identity, watching])

  // Clean up on tab close / navigate away
  useEffect(() => {
    const onPageHide = () => {
      const id = identityRef.current
      if (!id) return
      stopRef.current()
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      fetch(`${url}/rest/v1/device_locations?device_id=eq.${encodeURIComponent(id.deviceId)}&group_id=eq.${encodeURIComponent(id.groupId)}`,
        {
          method: 'DELETE',
          headers: { apiKey: key, Authorization: `Bearer ${key}` },
          keepalive: true,
        }
      )
    }
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [])

  return (
    <Router>
      <Landing path="/" onConfirm={handleSetup} />
      <TrackPage
        path="/track"
        identity={identity}
        devices={devices}
        loading={loading}
        watching={watching}
        position={position}
        geoError={geoError}
        dbError={dbError}
        onStart={start}
        onStop={handleStop}
        onClearIdentity={handleClearIdentity}
      />
      <MeasurePage
        path="/measure"
        position={position}
        geoError={geoError}
        watching={watching}
        onStart={start}
        onStop={stop}
      />
    </Router>
  )
}
