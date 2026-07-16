const DEG_TO_RAD = Math.PI / 180
const METRES_PER_DEG_LAT = 111320

/**
 * Compute the area of a polygon defined by [{lat, lng}] using the
 * Shoelace formula, projected to metres via a local flat-earth approximation.
 * Accurate to ~0.5 % for areas under a few km².
 */
export function shoelaceArea(points) {
  if (points.length < 3) return 0

  const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length
  const metresPerDegLng = METRES_PER_DEG_LAT * Math.cos(avgLat * DEG_TO_RAD)

  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    const xi = points[i].lng * metresPerDegLng
    const yi = points[i].lat * METRES_PER_DEG_LAT
    const xj = points[j].lng * metresPerDegLng
    const yj = points[j].lat * METRES_PER_DEG_LAT
    area += xi * yj - xj * yi
  }

  return Math.abs(area) / 2
}

/**
 * Format an area in m² to a readable metric string.
 */
export function formatArea(m2) {
  if (m2 < 10_000) return `${Math.round(m2)} m²`
  return `${(m2 / 10_000).toFixed(2)} ha`
}
