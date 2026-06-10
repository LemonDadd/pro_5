import { ref } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const theme = ref<Theme>('system')
const isDark = ref(false)

export function useTheme() {

  function initTheme() {
    const saved = localStorage.getItem('devbox_theme') as Theme | null
    if (saved) {
      theme.value = saved
    }
    applyTheme()
    setupSystemThemeListener()
  }

  function applyTheme() {
    if (theme.value === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = theme.value === 'dark'
    }

    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function setupSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme()
      }
    })
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('devbox_theme', newTheme)
    applyTheme()
  }

  function toggleTheme() {
    if (theme.value === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  return {
    theme,
    isDark,
    initTheme,
    setTheme,
    toggleTheme
  }
}
