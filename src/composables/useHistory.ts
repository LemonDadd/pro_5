import { ref, watch } from 'vue'

const STORAGE_KEY = 'devbox_history'
const MAX_ITEMS = 10

export interface HistoryItem {
  id: string
  toolId: string
  input: string
  output: string
  options: Record<string, any>
  timestamp: number
}

const history = ref<HistoryItem[]>(loadHistory())

function loadHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  } catch {
    // ignore
  }
}

watch(history, saveHistory, { deep: true })

export function useHistory() {
  function addHistory(toolId: string, input: string, output: string, options: Record<string, any> = {}) {
    const item: HistoryItem = {
      id: Date.now().toString(),
      toolId,
      input: input.slice(0, 1000),
      output: output.slice(0, 1000),
      options,
      timestamp: Date.now()
    }
    history.value.unshift(item)
    if (history.value.length > MAX_ITEMS) {
      history.value = history.value.slice(0, MAX_ITEMS)
    }
  }

  function getToolHistory(toolId: string): HistoryItem[] {
    return history.value.filter(h => h.toolId === toolId)
  }

  function clearHistory() {
    history.value = []
  }

  function removeHistory(id: string) {
    const index = history.value.findIndex(h => h.id === id)
    if (index > -1) {
      history.value.splice(index, 1)
    }
  }

  return {
    history,
    addHistory,
    getToolHistory,
    clearHistory,
    removeHistory
  }
}
