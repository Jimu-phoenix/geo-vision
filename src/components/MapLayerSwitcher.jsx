import { useState, useEffect, useRef } from 'preact/hooks'

const LAYERS = [
  {
    key: 'dark',
    label: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  {
    key: 'street',
    label: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  {
    key: 'satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
]

export function MapLayerSwitcher({ map, activeKey, onLayerChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} class="absolute bottom-3 left-3 z-[999]">
      {open && (
        <div class="bg-surface border border-border rounded mb-1.5 overflow-hidden shadow-lg">
          {LAYERS.map((layer) => (
            <button
              key={layer.key}
              onClick={() => { onLayerChange(layer.key); setOpen(false) }}
              class={`flex items-center gap-2 w-full px-3 py-2 font-mono text-[11px] tracking-[0.05em] cursor-pointer border-none transition-colors duration-150 text-left ${
                activeKey === layer.key
                  ? 'bg-[#00ff9d10] text-accent'
                  : 'bg-transparent text-muted hover:text-[#e8e8e8] hover:bg-[#ffffff08]'
              }`}
            >
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: activeKey === layer.key ? '#00ff9d' : '#555' }}
              />
              {layer.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        class="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded cursor-pointer text-muted hover:text-[#e8e8e8] hover:border-muted transition-colors duration-150"
        title="Change map layer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </button>
    </div>
  )
}

export { LAYERS }
