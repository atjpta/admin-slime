import { ref } from 'vue'

const MIN_DELAY = 300

export function useDetailLoading() {
  const loading = ref(true)

  async function withLoading(fn: () => Promise<void>) {
    loading.value = true
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_DELAY))
    try {
      await Promise.all([fn(), minDelay])
    } finally {
      loading.value = false
    }
  }

  return { loading, withLoading }
}
