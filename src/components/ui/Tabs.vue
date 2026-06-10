<script setup lang="ts">
import { provide, computed } from 'vue'
import { cn } from '@/utils/cn'

const TabsKey = '__devbox_tabs__'

const props = defineProps<{
  modelValue: string
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = computed(() => props.modelValue)

function setActiveTab(value: string) {
  emit('update:modelValue', value)
}

provide(TabsKey, { activeTab, setActiveTab })

const classes = computed(() => cn('', props.class))
</script>

<template>
  <div :class="classes" data-slot="tabs">
    <slot />
  </div>
</template>
