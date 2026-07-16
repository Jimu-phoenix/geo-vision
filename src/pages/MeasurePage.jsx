import { useState } from 'preact/hooks'
import { Nav } from '../components/Nav'
import { MeasureArea } from '../components/MeasureArea'

export function MeasurePage({ position, geoError, watching, onStart, onStop }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div class="flex flex-col h-screen bg-bg text-[#e8e8e8] font-sans overflow-hidden">
      <Nav
        mode="measure"
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        watching={watching}
        error={geoError}
      />

      <MeasureArea
        position={position}
        geoError={geoError}
        watching={watching}
        onStart={onStart}
        onStop={onStop}
        sidebarOpen={sidebarOpen}
      />
    </div>
  )
}
