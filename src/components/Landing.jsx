import { useState } from 'preact/hooks'
import { SetupModal } from './SetupModal'

export function Landing({ onConfirm, onMeasure }) {
  const [showSetup, setShowSetup] = useState(false)

  if (showSetup) {
    return <SetupModal onConfirm={(data) => { setShowSetup(false); onConfirm(data) }} />
  }

  return (
    <div class="min-h-screen bg-bg text-[#e8e8e8] font-sans overflow-y-auto bg-grid">
      <section class="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div class="font-mono text-[13px] tracking-[0.3em] text-accent mb-6">TRACKR</div>
        <h1 class="text-5xl font-extrabold mb-4 leading-tight text-[#e8e8e8]">Real-time<br/>device tracking</h1>
        <p class="text-muted text-[15px] max-w-md leading-relaxed mb-10">
          Track your devices in real time on a shared map. Share your Group ID with friends to see each other's locations.
        </p>
        <div class="flex gap-4">
          <button
            onClick={() => setShowSetup(true)}
            class="px-8 py-3 border border-accent rounded font-mono text-sm tracking-widest cursor-pointer transition-all duration-150 text-accent hover:bg-accent hover:text-black"
          >
            GET STARTED
          </button>
          <button
            onClick={onMeasure}
            class="px-8 py-3 border border-border rounded font-mono text-sm tracking-widest cursor-pointer transition-all duration-150 text-muted hover:text-[#e8e8e8] hover:border-muted"
          >
            MEASURE AREA
          </button>
        </div>
      </section>

      <section class="px-6 py-24 max-w-2xl mx-auto">
        <h2 class="font-mono text-xs tracking-[0.2em] text-accent mb-12 text-center">HOW IT WORKS</h2>
        <div class="space-y-12">
          <div class="flex gap-6">
            <span class="font-mono text-accent text-lg font-bold shrink-0 w-8">01</span>
            <div>
              <h3 class="font-semibold text-[#e8e8e8] mb-2">Create or join a group</h3>
              <p class="text-muted text-sm leading-relaxed">
                Set a Group ID when you first open the app. Create a new one, join an existing group shared by a friend, or use the Test group to try it out.
              </p>
            </div>
          </div>
          <div class="flex gap-6">
            <span class="font-mono text-accent text-lg font-bold shrink-0 w-8">02</span>
            <div>
              <h3 class="font-semibold text-[#e8e8e8] mb-2">Share your Group ID</h3>
              <p class="text-muted text-sm leading-relaxed">
                Send your Group ID to anyone you want to track with. They enter the same ID when they open the app to join your group.
              </p>
            </div>
          </div>
          <div class="flex gap-6">
            <span class="font-mono text-accent text-lg font-bold shrink-0 w-8">03</span>
            <div>
              <h3 class="font-semibold text-[#e8e8e8] mb-2">See everyone on the map</h3>
              <p class="text-muted text-sm leading-relaxed">
                Once broadcasting, your location updates in real time. Everyone in your group appears on the shared map.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="terms" class="px-6 py-24 max-w-2xl mx-auto border-t border-border">
        <h2 class="font-mono text-xs tracking-[0.2em] text-accent mb-8 text-center">TERMS & PRIVACY</h2>
        <div class="space-y-6 text-sm text-muted leading-relaxed">
          <p>
            <strong class="text-[#e8e8e8]">Location data is temporary.</strong> Your location is deleted from our database when you stop broadcasting or close your browser. We do not store historical location data.
          </p>
          <p>
            <strong class="text-[#e8e8e8]">Location is shared within your group only.</strong> Only people who have your exact Group ID can see your location on the map. No one outside your group can access your data.
          </p>
          <p>
            <strong class="text-[#e8e8e8]">Free to use.</strong> Trackr is completely free. No accounts, no sign-ups, no hidden data collection. Your privacy is built into the design.
          </p>
        </div>
      </section>
    </div>
  )
}
