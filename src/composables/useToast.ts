import { ref } from 'vue'

interface ToastItem {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration: number
  createdAt: number
}

const toasts = ref<ToastItem[]>([])
let toastId = 0
const DEDUP_THRESHOLD = 300

export function useToast() {
  function show(message: string, type: ToastItem['type'] = 'info', duration = 2500) {
    const now = Date.now()
    const existing = toasts.value.find(t => 
      t.message === message && t.type === type && (now - t.createdAt) < DEDUP_THRESHOLD
    )
    if (existing) {
      return existing.id
    }
    
    const id = ++toastId
    toasts.value.push({ id, type, message, duration, createdAt: now })
    setTimeout(() => {
      remove(id)
    }, duration)
    return id
  }

  function remove(id: number) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function success(message: string, duration?: number) {
    return show(message, 'success', duration)
  }

  function error(message: string, duration?: number) {
    return show(message, 'error', duration)
  }

  function warning(message: string, duration?: number) {
    return show(message, 'warning', duration)
  }

  function info(message: string, duration?: number) {
    return show(message, 'info', duration)
  }

  return {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info
  }
}
