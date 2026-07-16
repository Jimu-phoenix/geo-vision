import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { shoelaceArea, areaUncertainty, formatArea } from '../utils/area'
import { Menu } from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ACCENT = '#00ff9d'

function makeVertexIcon(index) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:18px;height:18px;
      border-radius:50%;
      background:${ACCENT};
      border:2px solid #fff;
      box-shadow:0 0 0 3px ${ACCENT}44;
      display:flex;align-items:center;justify-content:center;
      font-family:'Space Mono',monospace;
      font-size:8px;font-weight:700;color:#000;
    ">${index + 1}</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function makePositionIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;
      border-radius:50%;
      background:#3b82f6;
      border:2px solid #fff;
      box-shadow:0 0 0 3px #3b82f644;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

export function MeasureArea({ position, geoError, watching, onStart, onStop, onBack }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const vertexMarkersRef = useRef([])
  const positionMarkerRef = useRef(null)
  const lineRef = useRef(null)
  const polygonRef = useRef(null)

  const [points, setPoints] = useState([])
  const [done, setDone] = useState(false)
  const [area, setArea] = useState(null)
  const [uncertainty, setUncertainty] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Init map
  useEffect(() => {
    if (mapInstanceRef.current) return
    const map = L.map(mapRef.current, {
      center: [-13.9626, 33.7741],
      zoom: 16,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map)
    mapInstanceRef.current = map
  }, [])

  // Auto-start GPS on mount
  useEffect(() => {
    if (!watching) onStart()
    return () => { /* don't stop on unmount — parent manages */ }
  }, [])

  // Update position marker
  useEffect(() => {
    if (!mapInstanceRef.current || !position) return
    const latlng = [position.latitude, position.longitude]

    if (positionMarkerRef.current) {
      positionMarkerRef.current.setLatLng(latlng)
    } else {
      positionMarkerRef.current = L.marker(latlng, { icon: makePositionIcon(), zIndexOffset: -1000 })
        .addTo(mapInstanceRef.current)
    }
  }, [position])

  // Sync vertex markers + lines/polygon with points array
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    // Remove old vertex markers
    vertexMarkersRef.current.forEach((m) => m.remove())
    vertexMarkersRef.current = []

    // Remove old line/polygon
    if (lineRef.current) { lineRef.current.remove(); lineRef.current = null }
    if (polygonRef.current) { polygonRef.current.remove(); polygonRef.current = null }

    if (points.length === 0) return

    const latlngs = points.map((p) => [p.lat, p.lng])

    // Add vertex markers
    vertexMarkersRef.current = latlngs.map((ll, i) =>
      L.marker(ll, { icon: makeVertexIcon(i) }).addTo(map)
    )

    // Draw connecting line
    if (points.length >= 2) {
      lineRef.current = L.polyline(latlngs, { color: ACCENT, weight: 2, dashArray: '6 4' }).addTo(map)
    }

    // Draw filled polygon when 3+ points
    if (points.length >= 3) {
      polygonRef.current = L.polygon(latlngs, {
        color: ACCENT,
        fillColor: ACCENT,
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map)
    }

    // Fit bounds
    const bounds = L.latLngBounds(latlngs)
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 })
  }, [points])

  const recordPoint = useCallback(() => {
    if (!position || done) return
    setPoints((prev) => [
      ...prev,
      { lat: position.latitude, lng: position.longitude, accuracy: position.accuracy || 0 },
    ])
  }, [position, done])

  const undo = useCallback(() => {
    setPoints((prev) => prev.slice(0, -1))
  }, [])

  const clear = useCallback(() => {
    setPoints([])
    setDone(false)
    setArea(null)
    setUncertainty(null)
  }, [])

  const finish = useCallback(() => {
    if (points.length < 3) return
    setArea(shoelaceArea(points))
    setUncertainty(areaUncertainty(points))
    setDone(true)
  }, [points])

  const restart = useCallback(() => {
    setDone(false)
    setArea(null)
    setUncertainty(null)
    setPoints([])
  }, [])

  const removePoint = useCallback((index) => {
    setPoints((prev) => prev.filter((_, j) => j !== index))
  }, [])

  return (
    <div class="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside
        class="bg-surface border-r border-border flex flex-col overflow-hidden h-full shrink-0 transition-[width] duration-200"
        style={{ width: sidebarOpen ? '16rem' : '0' }}
      >
        <div class="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-border min-w-[16rem]">
          <span class="font-mono text-[10px] tracking-[0.2em] text-muted">MEASURE AREA</span>
          <span class="font-mono text-[10px] text-accent">{points.length} points</span>
        </div>

        {/* Status */}
        <div class="px-4 py-3.5 border-b border-border min-w-[16rem]">
          <div class="font-mono text-[9px] tracking-[0.15em] text-muted mb-2.5">STATUS</div>
          {done ? (
            <div>
              <div class="font-mono text-[9px] tracking-[0.15em] text-muted mb-1">AREA</div>
              <div class="font-mono text-[22px] font-bold text-accent tracking-[-0.02em] leading-none mb-1">
                {formatArea(area)}
              </div>
              <div class="font-mono text-[9px] text-muted mb-2.5">
                {points.length} vertices
              </div>
              {uncertainty && (
                <div class="space-y-0.5 mb-2.5">
                  <div class="font-mono text-[9px] tracking-[0.15em] text-muted">ACCURACY</div>
                  <div class="font-mono text-[11px] text-[#e8e8e8]">
                    ±{formatArea(uncertainty.rss)} <span class="text-muted">(statistical)</span>
                  </div>
                  <div class="font-mono text-[11px] text-muted">
                    ±{formatArea(uncertainty.worst)} <span class="text-[9px]">(worst-case)</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {!watching ? (
                <div class="font-mono text-[10px] text-muted italic mb-2.5">Waiting for GPS…</div>
              ) : position ? (
                <div class="font-mono text-[10px] text-[#e8e8e8] mb-2.5">
                  <span class="text-accent">●</span> GPS active — accuracy ±{Math.round(position.accuracy || 0)}m
                </div>
              ) : (
                <div class="font-mono text-[10px] text-muted italic mb-2.5">Acquiring signal…</div>
              )}
              <div class="font-mono text-[9px] text-muted">
                {points.length < 3
                  ? `Record at least ${3 - points.length} more point${points.length === 2 ? '' : 's'} to form a polygon`
                  : 'Polygon formed — tap Done to calculate'}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div class="px-4 py-3.5 border-b border-border space-y-2 min-w-[16rem]">
          {!done ? (
            <>
              <button
                onClick={recordPoint}
                disabled={!position}
                class={`block w-full px-3.5 py-2 border rounded font-mono text-[11px] tracking-[0.1em] cursor-pointer transition-all duration-150 text-center ${
                  position
                    ? 'border-accent text-accent hover:bg-accent hover:text-black'
                    : 'border-border text-muted cursor-not-allowed'
                }`}
              >
                ● Record Point
              </button>
              {points.length >= 3 && (
                <button
                  onClick={finish}
                  class="block w-full px-3.5 py-2 border border-[#a78bfa] rounded font-mono text-[11px] tracking-[0.1em] cursor-pointer transition-all duration-150 text-center text-[#a78bfa] hover:bg-[#a78bfa] hover:text-black"
                >
                  ✓ Done
                </button>
              )}
              <div class="flex gap-2">
                <button
                  onClick={undo}
                  disabled={points.length === 0}
                  class={`flex-1 px-3.5 py-2 border rounded font-mono text-[11px] tracking-[0.1em] cursor-pointer transition-all duration-150 text-center ${
                    points.length > 0
                      ? 'border-border text-muted hover:text-[#e8e8e8] hover:border-muted'
                      : 'border-border text-muted cursor-not-allowed'
                  }`}
                >
                  Undo
                </button>
                <button
                  onClick={clear}
                  disabled={points.length === 0}
                  class={`flex-1 px-3.5 py-2 border rounded font-mono text-[11px] tracking-[0.1em] cursor-pointer transition-all duration-150 text-center ${
                    points.length > 0
                      ? 'border-danger text-danger hover:bg-danger hover:text-white'
                      : 'border-border text-muted cursor-not-allowed'
                  }`}
                >
                  Clear
                </button>
              </div>
            </>
          ) : (
            <div class="space-y-2">
              <button
                onClick={restart}
                class="block w-full px-3.5 py-2 border border-accent rounded font-mono text-[11px] tracking-[0.1em] cursor-pointer transition-all duration-150 text-center text-accent hover:bg-accent hover:text-black"
              >
                New Measurement
              </button>
            </div>
          )}
        </div>

        {/* Point list */}
        <div class="flex-1 overflow-y-auto py-2 min-w-[16rem]">
          {points.length === 0 && (
            <div class="px-4 py-6 font-mono text-[11px] text-muted text-center">
              No points recorded yet
            </div>
          )}
          {points.map((p, i) => (
            <div
              key={i}
              class="flex items-start gap-2.5 px-4 py-2.5 border-b border-border"
            >
              <div
                class="w-2 h-2 rounded-full mt-1 shrink-0"
                style={{ background: ACCENT }}
              />
              <div class="flex-1">
                <div class="text-[12px] font-semibold text-[#e8e8e8] mb-0.5">
                  Point {i + 1}
                </div>
                <div class="font-mono text-[9px] text-muted">
                  {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                </div>
                <div class="font-mono text-[9px] text-[#444]">
                  ±{Math.round(p.accuracy)}m GPS
                </div>
              </div>
              {!done && (
                <button
                  onClick={() => removePoint(i)}
                  class="font-mono text-[9px] text-muted cursor-pointer bg-transparent border-none p-0 hover:text-danger"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Back button */}
        <div class="px-4 py-3 border-t border-border min-w-[16rem]">
          <button
            onClick={onBack}
            class="block w-full px-3.5 py-2 border border-border rounded font-mono text-[11px] tracking-[0.1em] cursor-pointer transition-all duration-150 text-center text-muted hover:text-[#e8e8e8] hover:border-muted"
          >
            ← Back
          </button>
        </div>
      </aside>

      {/* Map */}
      <main class="flex-1 relative overflow-hidden z-0">
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          class="absolute top-3 left-3 z-[999] w-8 h-8 flex items-center justify-center bg-surface border border-border rounded cursor-pointer text-muted hover:text-[#e8e8e8] hover:border-muted transition-colors duration-150"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Menu size={14} />
        </button>

        {geoError && (
          <div class="absolute top-3 left-1/2 -translate-x-1/2 z-[999] font-mono text-[10px] text-danger bg-[#ff4d6d18] px-3 py-1.5 rounded border border-[#ff4d6d44]">
            ⚠ {geoError}
          </div>
        )}
      </main>
    </div>
  )
}
