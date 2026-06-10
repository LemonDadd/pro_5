import { onMounted, onBeforeUnmount } from 'vue'

interface ShortcutHandlers {
  onCopy?: () => void
  onSwap?: () => void
  onClear?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  function handleKeyDown(e: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const ctrl = isMac ? e.metaKey : e.ctrlKey
    
    if (ctrl && e.shiftKey && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'c':
          if (handlers.onCopy) {
            handlers.onCopy()
            e.preventDefault()
          }
          break
        case 'x':
          if (handlers.onSwap) {
            handlers.onSwap()
            e.preventDefault()
          }
          break
        case 'l':
          if (handlers.onClear) {
            handlers.onClear()
            e.preventDefault()
          }
          break
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}

export function getShortcutKey(key: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const prefix = isMac ? '⌘⇧' : 'Ctrl+Shift+'
  return prefix + key.toUpperCase()
}
