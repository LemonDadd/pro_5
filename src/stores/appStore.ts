import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toolRegistry } from '@/tools/registry'
import type { ToolDefinition } from '@/tools/types'

export const useAppStore = defineStore('app', () => {
  const currentToolId = ref<string>('base64')
  const searchQuery = ref('')
  const sidebarOpen = ref(true)
  const mobileSidebarOpen = ref(false)
  const activeTab = ref<string>('encode')

  const currentTool = computed(() => {
    return toolRegistry.getToolById(currentToolId.value)
  })

  const filteredTools = computed(() => {
    if (searchQuery.value) {
      return toolRegistry.searchTools(searchQuery.value)
    }
    return toolRegistry.getTools()
  })

  const toolsByCategory = computed(() => {
    const result: Record<string, ToolDefinition[]> = {}
    const categories = toolRegistry.getCategories()
    categories.forEach(cat => {
      result[cat] = filteredTools.value.filter(t => t.category === cat)
    })
    return result
  })

  function setCurrentTool(toolId: string) {
    currentToolId.value = toolId
    const tool = toolRegistry.getToolById(toolId)
    if (tool) {
      activeTab.value = tool.category
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function toggleMobileSidebar() {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  }

  function closeMobileSidebar() {
    mobileSidebarOpen.value = false
  }

  return {
    currentToolId,
    currentTool,
    searchQuery,
    sidebarOpen,
    mobileSidebarOpen,
    activeTab,
    filteredTools,
    toolsByCategory,
    setCurrentTool,
    setSearchQuery,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar
  }
})
