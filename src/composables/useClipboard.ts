import { useToast } from './useToast'

export function useClipboard() {
  const { success, error } = useToast()

  async function copy(text: string, showToast = true): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      if (showToast) {
        success('已复制到剪贴板')
      }
      return true
    } catch (err) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        if (showToast) {
          success('已复制到剪贴板')
        }
        document.body.removeChild(textArea)
        return true
      } catch {
        if (showToast) {
          error('复制失败')
        }
        document.body.removeChild(textArea)
        return false
      }
    }
  }

  return {
    copy
  }
}
