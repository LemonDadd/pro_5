import { ref, type Ref } from 'vue'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { useHistory, type HistoryItem } from '@/composables/useHistory'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

export type { HistoryItem }

export interface ToolIOOptions {
  toolId: string
  defaultInput?: string
  defaultOutput?: string
  onClear?: () => void
  onSwap?: () => void
  onCopy?: () => string | undefined
  onRestore?: (item: HistoryItem) => void
  enableShortcuts?: boolean
}

export interface ToolIOReturn {
  inputText: Ref<string>
  outputText: Ref<string>
  errorMessage: Ref<string>
  handleClear: () => void
  handleSwap: () => void
  handleCopy: () => void
  handleRestore: (item: HistoryItem) => void
  addHistory: (input: string, output: string, options?: Record<string, any>) => void
  setError: (message: string, showToast?: boolean) => void
  clearError: () => void
  runAction: <T>(fn: () => T, onSuccess?: (result: T) => void) => T | undefined
  success: (message: string) => void
  copy: (text: string) => void
}

export function useToolIO(options: ToolIOOptions): ToolIOReturn {
  const { copy } = useClipboard()
  const { error: toastError, success } = useToast()
  const { addHistory: addHistoryRaw } = useHistory()

  const inputText = ref(options.defaultInput || '')
  const outputText = ref(options.defaultOutput || '')
  const errorMessage = ref('')

  function clearError() {
    errorMessage.value = ''
  }

  function setError(message: string, showToast: boolean = true) {
    errorMessage.value = message
    if (showToast) {
      toastError(message)
    }
  }

  function handleClear() {
    inputText.value = ''
    outputText.value = ''
    clearError()
    options.onClear?.()
  }

  function handleSwap() {
    const temp = inputText.value
    inputText.value = outputText.value
    outputText.value = temp
    clearError()
    options.onSwap?.()
  }

  function handleCopy() {
    const toCopy = options.onCopy ? options.onCopy() : outputText.value
    if (toCopy) {
      copy(toCopy)
      success('已复制')
    }
  }

  function handleRestore(item: HistoryItem) {
    inputText.value = item.input || ''
    outputText.value = item.output || ''
    clearError()
    if (options.onRestore) {
      options.onRestore(item)
    }
  }

  function addHistory(input: string, output: string, extra: Record<string, any> = {}) {
    addHistoryRaw(options.toolId, input, output, extra)
  }

  function runAction<T>(fn: () => T, onSuccess?: (result: T) => void): T | undefined {
    try {
      clearError()
      const result = fn()
      onSuccess?.(result)
      return result
    } catch (e: any) {
      setError(e.message || '操作失败', true)
      return undefined
    }
  }

  if (options.enableShortcuts !== false) {
    useKeyboardShortcuts({
      onCopy: handleCopy,
      onSwap: handleSwap,
      onClear: handleClear
    })
  }

  return {
    inputText,
    outputText,
    errorMessage,
    handleClear,
    handleSwap,
    handleCopy,
    handleRestore,
    addHistory,
    setError,
    clearError,
    runAction,
    success,
    copy
  }
}
