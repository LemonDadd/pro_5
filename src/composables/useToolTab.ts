import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useToolTab(defaultTab: string) {
  const route = useRoute()
  const router = useRouter()
  const activeTab = ref<string>(defaultTab)

  onMounted(() => {
    const queryTab = route.query.tab as string
    if (queryTab) {
      activeTab.value = queryTab
    }
  })

  watch(
    () => route.query.tab,
    (newTab) => {
      if (newTab && typeof newTab === 'string' && newTab !== activeTab.value) {
        activeTab.value = newTab
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
