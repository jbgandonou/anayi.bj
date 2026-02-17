import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

export function useLocalStorage<T extends Record<string, any>>(key: string, defaultValue: T) {
  const data = ref({ ...defaultValue }) as Ref<T>

  function save() {
    localStorage.setItem(key, JSON.stringify(data.value))
  }

  function load() {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        data.value = { ...defaultValue, ...JSON.parse(stored) }
      } catch {
        data.value = { ...defaultValue }
      }
    }
  }

  function clear() {
    localStorage.removeItem(key)
    data.value = { ...defaultValue }
  }

  function hasStoredData(): boolean {
    return localStorage.getItem(key) !== null
  }

  // Sauvegarde automatique toutes les 30s
  let interval: ReturnType<typeof setInterval>

  onMounted(() => {
    load()
    interval = setInterval(save, 30000)
  })

  onUnmounted(() => {
    clearInterval(interval)
  })

  // Sauvegarde à chaque changement
  watch(data, save, { deep: true })

  return { data, save, load, clear, hasStoredData }
}
