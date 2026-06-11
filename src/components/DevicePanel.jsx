import { useState } from 'preact/hooks'
import { haversineDistance, formatDistance } from '../utils/distance'

export function DevicePanel({ devices, ownDeviceId, watching, onStartBroadcast, onStopBroadcast }) {
  const [selectedId, setSelectedId] = useState(null)

  const formatTime = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const ownDevice = devices.find((d) => d.device_id === ownDeviceId)

  const getDistance = (device) => {
    if (!ownDevice || !ownDevice.latitude || device.device_id === ownDeviceId) return null
    const metres = haversineDistance(
      ownDevice.latitude, ownDevice.longitude,
      device.latitude,    device.longitude
    )
    return { metres, formatted: formatDistance(metres) }
  }

  const selectedDevice = selectedId ? devices.find((d) => d.device_id === selectedId) : null
  const selectedDistance = selectedDevice ? getDistance(selectedDevice) : null

  return (
    <aside class="bg-surface border-r border-border flex flex-col overflow-hidden h-full">
      <div class="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-border">
        <span class="font-mono text-[10px] tracking-[0.2em] text-muted">DEVICES</span>
        <span class="font-mono text-[10px] text-accent">{devices.length} online</span>
      </div>

      <div class="px-4 py-3.5 border-b border-border">
        <div class="font-mono text-[9px] tracking-[0.15em] text-muted mb-2.5">THIS DEVICE</div>
        {!watching ? (
          <button class="block w-full px-3.5 py-2 border border-accent rounded font-mono text-[11px] tracking-[0.1em] cursor-pointer transition-all duration-150 text-center text-accent hover:bg-accent hover:text-black" onClick={onStartBroadcast}>
            ▶ Start Broadcasting
          </button>
        ) : (
          <button class="block w-full px-3.5 py-2 border border-danger rounded font-mono text-[11px] tracking-[0.1em] cursor-pointer transition-all duration-150 text-center text-danger hover:bg-danger hover:text-white" onClick={onStopBroadcast}>
            ■ Stop Broadcasting
          </button>
        )}
      </div>

      {selectedDevice && (
        <div class="px-4 py-3.5 border-b border-border bg-[#a78bfa10] border-l-2 border-l-[#a78bfa]">
          <div class="font-mono text-[9px] tracking-[0.15em] text-muted mb-1">DISTANCE TO</div>
          <div class="text-[13px] font-semibold text-[#a78bfa] mb-2 truncate">{selectedDevice.label || selectedDevice.device_id}</div>
          {!ownDevice || !watching ? (
            <div class="font-mono text-[10px] text-muted mb-2.5 italic">Start broadcasting to measure</div>
          ) : (
            <>
              <div class="font-mono text-[22px] font-bold text-[#e8e8e8] tracking-[-0.02em] leading-none mb-1">{selectedDistance?.formatted ?? '—'}</div>
              <div class="font-mono text-[9px] text-muted mb-2.5">
                ±{Math.round((ownDevice.accuracy || 0) + (selectedDevice.accuracy || 0))}m combined GPS error
              </div>
            </>
          )}
          <button class="bg-none border-none font-mono text-[10px] text-muted cursor-pointer p-0 tracking-[0.05em] hover:text-[#e8e8e8]" onClick={() => setSelectedId(null)}>✕ clear</button>
        </div>
      )}

      <div class="flex-1 overflow-y-auto py-2">
        {devices.length === 0 && (
          <div class="px-4 py-6 font-mono text-[11px] text-muted text-center">No devices online</div>
        )}
        {devices.map((d) => {
          const isOwn = d.device_id === ownDeviceId
          const isSelected = d.device_id === selectedId
          const dist = !isOwn ? getDistance(d) : null

          return (
            <div
              key={d.device_id}
              class={`flex items-start gap-2.5 px-4 py-2.5 border-b border-border transition-[background] duration-150 relative ${isOwn ? 'bg-[#00ff9d08]' : ''} ${isSelected ? 'bg-[#a78bfa08] border-l-2 border-l-[#a78bfa] pl-[14px]' : ''}`}
              onClick={() => !isOwn && setSelectedId(isSelected ? null : d.device_id)}
              style={{ cursor: isOwn ? 'default' : 'pointer' }}
            >
              <div
                class="w-2 h-2 rounded-full mt-1 shrink-0"
                style={{ background: isOwn ? '#00ff9d' : isSelected ? '#a78bfa' : '#ff4d6d' }}
              />
              <div class="flex-1">
                <div class="text-[13px] font-semibold text-[#e8e8e8] mb-0.5">{d.label || d.device_id}</div>
                <div class="font-mono text-[9px] text-muted mb-0.5">
                  ±{Math.round(d.accuracy || 0)}m · {formatTime(d.updated_at)}
                </div>
                <div class="font-mono text-[9px] text-[#444]">
                  {d.latitude.toFixed(5)}, {d.longitude.toFixed(5)}
                </div>
                {dist && watching && (
                  <div class="font-mono text-[10px] text-accent mt-0.5 tracking-[0.05em]">↔ {dist.formatted}</div>
                )}
              </div>
              {isOwn && <span class="font-mono text-[8px] tracking-[0.1em] text-accent border border-accent px-1 py-px rounded shrink-0">YOU</span>}
              {isSelected && <span class="font-mono text-[8px] tracking-[0.1em] text-[#a78bfa] border border-[#a78bfa] px-1 py-px rounded shrink-0">SELECTED</span>}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
