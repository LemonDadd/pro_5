<script setup lang="ts">
import { inject, computed } from 'vue'
import { cn } from '@/utils/cn'

const TabsKey = '__devbox_tabs__'

const props = defineProps<{
  value: string
  class?: string
}>()

const tabs = inject<any>(TabsKey)!
const isActive = computed(() => tabs.activeTab.value === props.value)

const classes = computed(() => cn(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  isActive.value
    ? 'bg-background text-foreground shadow-sm'
    : 'text-muted-foreground hover:text-foreground',
  props.class
))

function onClick() {
  tabs.setActiveTab(props.value)
}
</script>

<template>
  <button
    role="tab"
    :aria-selected="isActive"
    :class="classes"
    @click="onClick"
  >
    <slot />
  </button>
</template>
