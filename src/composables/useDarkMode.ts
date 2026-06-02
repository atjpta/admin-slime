import { ref } from 'vue'

// Singleton: theo dõi color-scheme của DaisyUI theme (set qua data-theme trên <html>)
// Mọi component share chung 1 ref + 1 observer.
const isDark = ref(false)
let initialized = false

function detect() {
  const scheme = getComputedStyle(document.documentElement).colorScheme
  isDark.value = scheme.includes('dark')
}

export function useDarkMode() {
  if (!initialized && typeof window !== 'undefined') {
    initialized = true
    detect()
    const observer = new MutationObserver(detect)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
  }
  return isDark
}
