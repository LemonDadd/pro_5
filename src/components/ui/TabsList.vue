<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: string
}>()

const classes = computed(() => cn(
  'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
  props.class
))
</script>

<template>
  <div role="tablist" :class="classes" data-slot="tabs-list">
    <slot />
  </div>
</template>
