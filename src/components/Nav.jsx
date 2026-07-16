import { Menu, X } from 'lucide-react'

export function Nav({ mode, sidebarOpen, onToggleSidebar, watching, identity, error, onClearIdentity }) {
  return (
    <header class="flex items-center justify-between px-5 h-12 bg-surface border-b border-border shrink-0">
      <div class="flex items-center gap-3.5">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            class="text-muted hover:text-[#e8e8e8] cursor-pointer bg-transparent border-none p-0 transition-colors duration-150 flex items-center"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu size={16} />
          </button>
        )}
        <span class="font-mono text-sm font-bold tracking-[0.2em] text-accent">TRACKR</span>
        {mode === 'track' && watching && (
          <span class="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-accent">
            <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> LIVE
          </span>
        )}
        {mode === 'measure' && (
          <span class="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-[#a78bfa]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" /> MEASURE
          </span>
        )}
      </div>
      <div class="flex items-center gap-3.5">
        {error && (
          <span class="font-mono text-[10px] text-danger bg-[#ff4d6d18] px-2 py-0.5 rounded border border-[#ff4d6d44]">
            ⚠ {error}
          </span>
        )}
        {identity && (
          <span class="font-mono text-[11px] text-muted tracking-[0.05em]">{identity.label}</span>
        )}
        {identity && onClearIdentity && (
          <button
            onClick={onClearIdentity}
            class="text-muted hover:text-[#e8e8e8] cursor-pointer bg-transparent border-none p-0 transition-colors duration-150 flex items-center"
            title="Reset identity"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </header>
  )
}
