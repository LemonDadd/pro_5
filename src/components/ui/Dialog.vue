<script setup lang="ts">
import { watch, onMounted, onUnmounted, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import Button from './Button.vue'

interface Props {
  modelValue: boolean
  title?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function close() {
  isOpen.value = false
}

function onOverlayClick() {
  close()
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
  }
}

watch(isOpen, (val) => {
  if (val) {
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeyDown)
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  if (isOpen.value) {
    document.addEventListener('keydown', onKeyDown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = ''
})

const classes = computed(() => cn('', props.class))
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="onOverlayClick"
        />
        <div
          :class="[
            'relative z-50 w-full max-w-lg mx-4 bg-background rounded-lg shadow-lg border border-border',
            classes
          ]"
          @click.stop
        >
          <div class="flex items-center justify-between p-4 border-b border-border">
            <h3 v-if="title" class="text-lg font-semibold">{{ title }}</h3>
            <Button variant="ghost" size="icon" @click="close">
              <X class="w-4 h-4" />
            </Button>
          </div>
          <div class="p-4">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from > div:last-child,
.dialog-leave-to > div:last-child {
  transform: scale(0.95);
}
</style>
