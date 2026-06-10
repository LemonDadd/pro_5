import { ref, watch, onMounted, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useToolTab<T extends string = string>(defaultTab: T): Ref<T> {
  const route = useRoute()
  const router = useRouter()
  const activeTab = ref<T>(defaultTab) as Ref<T>

  onMounted(() => {
    const queryTab = route.query.tab as string | undefined
    if (queryTab && typeof queryTab === 'string') {
      activeTab.value = queryTab as T
    }
  })

  watch(
    () => route.query.tab,
    (newTab) => {
      if (newTab && typeof newTab === 'string' && newTab !== activeTab.value) {
        activeTab.value = newTab as T
      }
    }
  )

  watch(activeTab, (newVal) => {
    const currentQueryTab = route.query.tab
    if (currentQueryTab !== newVal) {
      router.replace({
        path: route.path,
        query: { ...route.query, tab: newVal }
      })
    }
  })

  return activeTab
}
