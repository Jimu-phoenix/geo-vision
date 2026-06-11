import { useState } from 'preact/hooks'

function generateGroupId() {
  return 'grp-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

function generateDeviceId() {
  return 'vis-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

const modes = [
  { key: 'create', label: 'Create' },
  { key: 'join', label: 'Join' },
  { key: 'test', label: 'Test' },
]

export function SetupModal({ onConfirm }) {
  const urlParams = new URLSearchParams(window.location.search)
  const urlGroupId = urlParams.get('g')

  const [mode, setMode] = useState(urlGroupId ? 'join' : 'create')
  const [groupId, setGroupId] = useState(urlGroupId || generateGroupId())
  const [deviceId, setDeviceId] = useState(generateDeviceId())
  const [label, setLabel] = useState('')

  const handleModeChange = (newMode) => {
    setMode(newMode)
    if (newMode === 'create') {
      setGroupId(generateGroupId())
    } else if (newMode === 'test') {
      setGroupId('grp-Test')
    } else {
      setGroupId('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!deviceId.trim() || !groupId.trim()) return
    onConfirm({ groupId: groupId.trim(), deviceId: deviceId.trim(), label: label.trim() || deviceId.trim() })
  }

  return (
    <div class="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm">
      <div class="bg-surface border border-border rounded-lg p-9 w-full max-w-[420px] animate-[slideUp_0.25s_ease]">
        <div class="font-mono text-[11px] tracking-[0.3em] text-accent mb-4">TRACKR</div>
        <h2 class="text-[22px] font-extrabold mb-2 text-[#e8e8e8]">Join or Create a Group</h2>
        <p class="text-[13px] text-muted leading-relaxed mb-6">
          Devices in the same group can see each other on the map. Share your Group ID with anyone you want to track with.
        </p>

        <div class="flex gap-2 mb-5">
          {modes.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => handleModeChange(m.key)}
              class={`flex-1 px-3 py-2 rounded font-mono text-[10px] tracking-[0.1em] cursor-pointer transition-all duration-150 border ${
                mode === m.key
                  ? 'bg-accent text-black border-accent'
                  : 'bg-transparent text-muted border-border hover:text-[#e8e8e8] hover:border-muted'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <label class="block font-mono text-[9px] tracking-[0.15em] text-muted mb-1.5">GROUP ID</label>
          {mode === 'join' ? (
            <input
              class="w-full bg-bg border border-border rounded px-3 py-2.5 text-[#e8e8e8] font-mono text-[13px] outline-none transition-[border-color] duration-150 mb-4 focus:border-accent placeholder:text-muted"
              value={groupId}
              onInput={(e) => setGroupId(e.target.value)}
              placeholder="e.g. grp-ABCDEF"
              required
              autoFocus
            />
          ) : (
            <div class="w-full bg-bg border border-border rounded px-3 py-2.5 text-accent font-mono text-[13px] mb-4 cursor-default">
              {groupId}
            </div>
          )}

          <label class="block font-mono text-[9px] tracking-[0.15em] text-muted mb-1.5">DEVICE ID</label>
          <input
            class="w-full bg-bg border border-border rounded px-3 py-2.5 text-[#e8e8e8] font-mono text-[13px] outline-none transition-[border-color] duration-150 mb-4 focus:border-accent placeholder:text-muted"
            value={deviceId}
            onInput={(e) => setDeviceId(e.target.value)}
            placeholder="e.g. vis-AB12CD"
            required
          />
          <label class="block font-mono text-[9px] tracking-[0.15em] text-muted mb-1.5">DISPLAY LABEL (optional)</label>
          <input
            class="w-full bg-bg border border-border rounded px-3 py-2.5 text-[#e8e8e8] font-mono text-[13px] outline-none transition-[border-color] duration-150 mb-1 focus:border-accent placeholder:text-muted"
            value={label}
            onInput={(e) => setLabel(e.target.value)}
            placeholder="e.g. Phoenix's Phone"
          />
          <button type="submit" class="block w-full px-3.5 py-2 border border-accent rounded font-mono text-[11px] tracking-widest cursor-pointer transition-all duration-150 text-center text-accent hover:bg-accent hover:text-black mt-6">
            Enter Tracker →
          </button>
        </form>
      </div>
    </div>
  )
}
