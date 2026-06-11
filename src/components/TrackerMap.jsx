import { useEffect, useRef } from 'preact/hooks'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet's default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ACCENT = '#00ff9d'

function makeIcon(isOwn) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;
      border-radius:50%;
      background:${isOwn ? ACCENT : '#ff4d6d'};
      border:2px solid #fff;
      box-shadow:0 0 0 3px ${isOwn ? ACCENT : '#ff4d6d'}44;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

export function TrackerMap({ devices, ownDeviceId }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})

  // Init map once
  useEffect(() => {
    if (mapInstanceRef.current) return
    mapInstanceRef.current = L.map(mapRef.current, {
      center: [-13.9626, 33.7741], // Lilongwe default
      zoom: 14,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current)
  }, [])

  // Update markers on devices change
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current
    const seen = new Set()

    devices.forEach((device) => {
      const { device_id, latitude, longitude, accuracy, label } = device
      seen.add(device_id)
      const latlng = [latitude, longitude]
      const isOwn = device_id === ownDeviceId

      if (markersRef.current[device_id]) {
        // Update existing marker
        markersRef.current[device_id].marker.setLatLng(latlng)
        markersRef.current[device_id].circle.setLatLng(latlng)
        if (accuracy) markersRef.current[device_id].circle.setRadius(accuracy)
      } else {
        // Create new marker + accuracy circle
        const marker = L.marker(latlng, { icon: makeIcon(isOwn) })
          .addTo(map)
          .bindPopup(`<b>${label || device_id}</b><br>±${Math.round(accuracy || 0)}m`)

        const circle = L.circle(latlng, {
          radius: accuracy || 10,
          color: isOwn ? ACCENT : '#ff4d6d',
          fillColor: isOwn ? ACCENT : '#ff4d6d',
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(map)

        markersRef.current[device_id] = { marker, circle }
      }
    })

    // Remove stale markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!seen.has(id)) {
        markersRef.current[id].marker.remove()
        markersRef.current[id].circle.remove()
        delete markersRef.current[id]
      }
    })

    // Pan to own device if present
    if (ownDeviceId && markersRef.current[ownDeviceId]) {
      map.panTo(markersRef.current[ownDeviceId].marker.getLatLng())
    }
  }, [devices, ownDeviceId])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
