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
  'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  props.class
))
</script>

<template>
  <div
    v-show="isActive"
    role="tabpanel"
    :class="classes"
    class="animate-fade-in"
  >
    <slot />
  </div>
</template>
