<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Copy, Trash2, ArrowRightLeft, Clock } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import { cn } from '@/utils/cn'
import HistoryPanel from '@/components/workspace/HistoryPanel.vue'
import type { HistoryItem } from '@/composables/useHistory'

interface Props {
  title?: string
  description?: string
  showSwap?: boolean
  showClear?: boolean
  showCopy?: boolean
  showHistory?: boolean
  toolId?: string
  layout?: 'horizontal' | 'vertical'
  inputLabel?: string
  outputLabel?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  showSwap: true,
  showClear: true,
  showCopy: true,
  showHistory: true,
  toolId: '',
  layout: 'horizontal',
  inputLabel: '',
  outputLabel: ''
})

const emit = defineEmits<{
  clear: []
  swap: []
  copy: []
  restore: [item: HistoryItem]
}>()

const { t } = useI18n()
const historyVisible = ref(false)

const classes = computed(() => cn(
  'flex flex-col h-full',
  props.class
))

const containerClasses = computed(() => cn(
  'flex-1 min-h-0 gap-4',
  props.layout === 'horizontal' ? 'flex flex-col lg:flex-row' : 'flex flex-col'
))

function handleCopy() {
  emit('copy')
}

function handleClear() {
  emit('clear')
}

function handleSwap() {
  emit('swap')
}

function handleHistory() {
  historyVisible.value = true
}

function handleRestore(item: HistoryItem) {
  emit('restore', item)
}
</script>

<template>
  <div :class="classes">
    <div v-if="$slots.header || title" class="flex items-center justify-between mb-4">
      <div>
        <h2 v-if="title" class="text-lg font-semibold">{{ title }}</h2>
        <p v-if="description" class="text-sm text-muted-foreground mt-1">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="$slots.toolbar" class="mb-4">
      <slot name="toolbar" />
    </div>

    <div :class="containerClasses">
      <div class="flex-1 flex flex-col min-h-0 min-w-0">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-foreground">
            {{ inputLabel || t('common.input') }}
          </span>
          <div class="flex items-center gap-1">
            <Button
              v-if="showHistory && toolId"
              variant="ghost"
              size="sm"
              class="h-7 px-2 text-xs"
              @click="handleHistory"
            >
              <Clock class="w-3.5 h-3.5 mr-1" />
              {{ t('app.recent') }}
            </Button>
            <Button
              v-if="showClear"
              variant="ghost"
              size="sm"
              class="h-7 px-2 text-xs"
              @click="handleClear"
            >
              <Trash2 class="w-3.5 h-3.5 mr-1" />
              {{ t('common.clear') }}
            </Button>
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <slot name="input" />
        </div>
      </div>

      <div
        v-if="showSwap"
        :class="[
          'flex items-center justify-center',
          layout === 'horizontal' ? 'lg:w-auto' : 'h-auto'
        ]"
      >
        <Button variant="outline" size="icon" @click="handleSwap">
          <ArrowRightLeft
            :class="[
              'w-4 h-4',
              layout === 'horizontal' ? '' : 'rotate-90'
            ]"
          />
        </Button>
      </div>

      <div class="flex-1 flex flex-col min-h-0 min-w-0">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-foreground">
            {{ outputLabel || t('common.output') }}
          </span>
          <div class="flex items-center gap-1">
            <Button
              v-if="showCopy"
              variant="ghost"
              size="sm"
              class="h-7 px-2 text-xs"
              @click="handleCopy"
            >
              <Copy class="w-3.5 h-3.5 mr-1" />
              {{ t('common.copy') }}
            </Button>
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <slot name="output" />
        </div>
      </div>
    </div>

    <HistoryPanel
      v-if="toolId"
      :tool-id="toolId"
      v-model:visible="historyVisible"
      @restore="handleRestore"
    />
  </div>
</template>
