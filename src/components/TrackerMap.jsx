import { useState, useEffect, useRef } from 'preact/hooks'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapLayerSwitcher, LAYERS } from './MapLayerSwitcher'

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
  const tileLayersRef = useRef({})
  const [activeLayer, setActiveLayer] = useState('dark')

  // Init map once
  useEffect(() => {
    if (mapInstanceRef.current) return
    const map = L.map(mapRef.current, {
      center: [-13.9626, 33.7741],
      zoom: 14,
      zoomControl: true,
    })

    // Create all tile layers, only add the default
    LAYERS.forEach((layer) => {
      const tl = L.tileLayer(layer.url, {
        attribution: layer.attribution,
        maxZoom: 19,
      })
      tileLayersRef.current[layer.key] = tl
      if (layer.key === 'dark') tl.addTo(map)
    })

    mapInstanceRef.current = map
  }, [])

  const handleLayerChange = (key) => {
    const map = mapInstanceRef.current
    if (!map) return
    map.removeLayer(tileLayersRef.current[activeLayer])
    tileLayersRef.current[key].addTo(map)
    setActiveLayer(key)
  }

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
        markersRef.current[device_id].marker.setLatLng(latlng)
        markersRef.current[device_id].circle.setLatLng(latlng)
        if (accuracy) markersRef.current[device_id].circle.setRadius(accuracy)
      } else {
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

    Object.keys(markersRef.current).forEach((id) => {
      if (!seen.has(id)) {
        markersRef.current[id].marker.remove()
        markersRef.current[id].circle.remove()
        delete markersRef.current[id]
      }
    })

    if (ownDeviceId && markersRef.current[ownDeviceId]) {
      map.panTo(markersRef.current[ownDeviceId].marker.getLatLng())
    }
  }, [devices, ownDeviceId])

  return (
    <div class="relative w-full h-full">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {mapInstanceRef.current && (
        <MapLayerSwitcher
          map={mapInstanceRef.current}
          activeKey={activeLayer}
          onLayerChange={handleLayerChange}
        />
      )}
    </div>
  )
}
