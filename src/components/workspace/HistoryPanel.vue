<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock, Trash2, X, RotateCcw } from 'lucide-vue-next'
import { useHistory, type HistoryItem } from '@/composables/useHistory'
import { truncate } from '@/utils/string'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/Button.vue'

interface Props {
  toolId: string
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'restore': [item: HistoryItem]
}>()

const { t } = useI18n()
const { getToolHistory, removeHistory, clearHistory } = useHistory()
const { success } = useToast()

const items = computed(() => {
  return getToolHistory(props.toolId).slice(0, 10)
})

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp
  if (diff < 60000) {
    return '刚刚'
  }
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + ' 分钟前'
  }
  if (diff < 86400000) {
    return Math.floor(diff / 3600000) + ' 小时前'
  }
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
}

function handleRestore(item: HistoryItem) {
  emit('restore', item)
  emit('update:visible', false)
  success('已恢复历史记录')
}

function handleRemove(e: Event, id: string) {
  e.stopPropagation()
  removeHistory(id)
}

function handleClearAll() {
  clearHistory()
  emit('update:visible', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
        @click.self="emit('update:visible', false)"
      >
        <div class="bg-background border border-border rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between p-4 border-b border-border">
            <div class="flex items-center gap-2">
              <Clock class="w-5 h-5 text-muted-foreground" />
              <h3 class="font-semibold text-foreground">{{ t('app.recent') }} ({{ items.length }}/10)</h3>
            </div>
            <div class="flex items-center gap-2">
              <Button
                v-if="items.length > 0"
                size="sm"
                variant="ghost"
                class="text-red-500 hover:text-red-600"
                @click="handleClearAll"
              >
                <Trash2 class="w-4 h-4 mr-1" />
                清空
              </Button>
              <Button size="sm" variant="ghost" size-icon @click="emit('update:visible', false)">
                <X class="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-2">
            <div v-if="items.length === 0" class="py-12 text-center text-muted-foreground">
              <Clock class="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p class="text-sm">暂无历史记录</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="item in items"
                :key="item.id"
                class="group p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-colors"
                @click="handleRestore(item)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <div class="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <p class="text-xs text-muted-foreground mb-1">输入</p>
                        <p class="text-xs font-mono text-foreground truncate">
                          {{ truncate(item.input, 50) || '(空)' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs text-muted-foreground mb-1">输出</p>
                        <p class="text-xs font-mono text-foreground truncate">
                          {{ truncate(item.output, 50) || '(空)' }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock class="w-3 h-3" />
                      <span>{{ formatTime(item.timestamp) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      size-icon
                      class="h-7 w-7"
                      @click.stop="handleRemove($event, item.id)"
                    >
                      <Trash2 class="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                    </Button>
                  </div>
                </div>
                <div class="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                  <span class="text-xs text-muted-foreground">
                    {{ Object.entries(item.options || {}).map(([k, v]) => `${k}:${String(v)}`).join(' · ') || '默认选项' }}
                  </span>
                  <Button size="sm" variant="ghost" class="h-7 px-2 text-xs">
                    <RotateCcw class="w-3 h-3 mr-1" />
                    恢复
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
