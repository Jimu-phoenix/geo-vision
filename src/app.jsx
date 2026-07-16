import { useState, useEffect, useRef } from 'preact/hooks'
import { Menu, X } from 'lucide-react'
import { TrackerMap } from './components/TrackerMap'
import { DevicePanel } from './components/DevicePanel'
import { Landing } from './components/Landing'
import { MeasureArea } from './components/MeasureArea'
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

  const [mode, setMode] = useState(null) // null | 'track' | 'measure'
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [clearing, setClearing] = useState(false)

  const { position, error: geoError, watching, start, stop } = useGeolocation()
  const stopRef = useRef(stop)
  stopRef.current = stop

  const { devices, loading, error: dbError, removeFromList } = useTracker(identity?.groupId)
  const broadcastErrorRef = useRef(null)

  const handleSetup = (id) => {
    localStorage.setItem('trackr_identity', JSON.stringify(id))
    setIdentity(id)
  }

  const handleMeasure = () => {
    setMode('measure')
  }

  useEffect(() => {
    if (!position || !identity || !watching) return

    broadcastPosition({
      deviceId: identity.deviceId,
      groupId: identity.groupId,
      label: identity.label,
      ...position,
    }).catch((err) => {
      console.error('Broadcast error:', err)
    })
  }, [position, identity, watching])

  const handleStop = async () => {
    setClearing(true)
    stop()
    if (identity) {
      await removeDevice(identity.deviceId, identity.groupId).catch(console.error)
      removeFromList(identity.deviceId)
    }
    setClearing(false)
  }

  const handleClearIdentity = async () => {
    setClearing(true)
    if (watching) {
      stop()
    }
    if (identity) {
      await removeDevice(identity.deviceId, identity.groupId).catch(console.error)
    }
    localStorage.removeItem('trackr_identity')
    setClearing(false)
    setIdentity(null)
  }

  // Clean up on tab close / navigate away
  useEffect(() => {
    const onPageHide = () => {
      const id = identityRef.current
      if (!id) return
      stopRef.current()
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      fetch(
        `${url}/rest/v1/device_locations?device_id=eq.${encodeURIComponent(id.deviceId)}&group_id=eq.${encodeURIComponent(id.groupId)}`,
        {
          method: 'DELETE',
          headers: {
            apiKey: key,
            Authorization: `Bearer ${key}`,
          },
          keepalive: true,
        }
      )
    }
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [])

  if (mode === 'measure') {
    return (
      <div class="flex flex-col h-screen bg-bg text-[#e8e8e8] font-sans overflow-hidden">
        <header class="flex items-center justify-between px-5 h-12 bg-surface border-b border-border shrink-0">
          <div class="flex items-center gap-3.5">
            <span class="font-mono text-sm font-bold tracking-[0.2em] text-accent">TRACKR</span>
            <span class="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-[#a78bfa]">
              <span class="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" /> MEASURE
            </span>
          </div>
          <div class="flex items-center gap-3.5">
            {geoError && (
              <span class="font-mono text-[10px] text-danger bg-[#ff4d6d18] px-2 py-0.5 rounded border border-[#ff4d6d44]">
                ⚠ {geoError}
              </span>
            )}
          </div>
        </header>
        <MeasureArea
          position={position}
          geoError={geoError}
          watching={watching}
          onStart={start}
          onStop={stop}
          onBack={() => { setMode(null); stop() }}
        />
      </div>
    )
  }

  if (!identity) {
    return <Landing onConfirm={handleSetup} onMeasure={handleMeasure} />
  }

  return (
    <>
      <div class="flex flex-col h-screen bg-bg text-[#e8e8e8] font-sans overflow-hidden">
        <header class="flex items-center justify-between px-5 h-12 bg-surface border-b border-border shrink-0">
          <div class="flex items-center gap-3.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              class="text-muted hover:text-[#e8e8e8] cursor-pointer bg-transparent border-none p-0 transition-colors duration-150 flex items-center"
              title="Toggle sidebar"
            >
              <Menu size={16} />
            </button>
            <span class="font-mono text-sm font-bold tracking-[0.2em] text-accent">TRACKR</span>
            {watching && (
              <span class="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-accent">
                <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> LIVE
              </span>
            )}
          </div>
          <div class="flex items-center gap-3.5">
            {(geoError || dbError) && (
              <span class="font-mono text-[10px] text-danger bg-[#ff4d6d18] px-2 py-0.5 rounded border border-[#ff4d6d44]">
                ⚠ {geoError || dbError}
              </span>
            )}
            <span class="font-mono text-[11px] text-muted tracking-[0.05em]">{identity.label}</span>
            <button
              onClick={handleClearIdentity}
              class="text-muted hover:text-[#e8e8e8] cursor-pointer bg-transparent border-none p-0 transition-colors duration-150 flex items-center"
              title="Reset identity"
            >
              <X size={14} />
            </button>
          </div>
        </header>

        <div class="flex flex-1 overflow-hidden">
          {/* Mobile sidebar — fixed overlay, outside flex flow */}
          {sidebarOpen && (
            <>
              <div class="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
              <div class="fixed inset-y-0 left-0 z-40 w-64 shadow-xl md:hidden">
                <DevicePanel
                  devices={devices}
                  ownDeviceId={identity.deviceId}
                  watching={watching}
                  onStartBroadcast={start}
                  onStopBroadcast={handleStop}
                />
              </div>
            </>
          )}

          {/* Desktop sidebar — inline in flex flow */}
          <div class={`hidden md:flex ${sidebarOpen ? 'w-64' : 'w-0'} shrink-0 overflow-hidden transition-all duration-200`}>
            <DevicePanel
              devices={devices}
              ownDeviceId={identity.deviceId}
              watching={watching}
              onStartBroadcast={start}
              onStopBroadcast={handleStop}
            />
          </div>

          <main class="flex-1 relative overflow-hidden z-0">
            {loading ? (
              <div class="flex items-center justify-center h-full font-mono text-xs text-muted tracking-[0.1em]">
                Connecting to Server…
              </div>
            ) : (
              <TrackerMap devices={devices} ownDeviceId={identity.deviceId} />
            )}
          </main>
        </div>
      </div>

      {clearing && (
        <div class="fixed inset-0 z-[9999] bg-black/80 flex flex-col items-center justify-center gap-4">
          <div class="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p class="font-mono text-sm text-[#e8e8e8] tracking-[0.05em]">
            Please wait while we clear your live location…
          </p>
        </div>
      )}
    </>
  )
}
