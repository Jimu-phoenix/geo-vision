import { useState } from 'preact/hooks'
import { Nav } from '../components/Nav'
import { DevicePanel } from '../components/DevicePanel'
import { TrackerMap } from '../components/TrackerMap'

export function TrackPage({
  identity,
  devices,
  loading,
  watching,
  position,
  geoError,
  dbError,
  onStart,
  onStop,
  onClearIdentity,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [clearing, setClearing] = useState(false)

  const handleStop = async () => {
    setClearing(true)
    await onStop()
    setClearing(false)
  }

  const error = geoError || dbError

  return (
    <>
      <div class="flex flex-col h-screen bg-bg text-[#e8e8e8] font-sans overflow-hidden">
        <Nav
          mode="track"
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          watching={watching}
          identity={identity}
          error={error}
          onClearIdentity={onClearIdentity}
        />

        <div class="flex flex-1 overflow-hidden">
          {/* Mobile sidebar — fixed overlay */}
          {sidebarOpen && (
            <>
              <div class="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
              <div class="fixed inset-y-0 left-0 z-40 w-64 shadow-xl md:hidden">
                <DevicePanel
                  devices={devices}
                  ownDeviceId={identity.deviceId}
                  watching={watching}
                  onStartBroadcast={onStart}
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
              onStartBroadcast={onStart}
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
