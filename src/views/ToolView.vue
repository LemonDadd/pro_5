<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { toolRegistry } from '@/tools/registry'

const route = useRoute()
const appStore = useAppStore()

const currentTool = computed(() => {
  const toolId = route.params.toolId as string
  return toolRegistry.getToolById(toolId)
})

watch(
  () => route.params.toolId,
  (toolId) => {
    if (toolId && typeof toolId === 'string') {
      appStore.setCurrentTool(toolId)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="h-full">
    <component
      v-if="currentTool"
      :is="currentTool.component"
    />
    <div
      v-else
      class="h-full flex items-center justify-center text-muted-foreground"
    >
      工具不存在
    </div>
  </div>
</template>
