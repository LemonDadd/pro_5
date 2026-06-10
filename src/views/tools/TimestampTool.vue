<script setup lang="ts">
import { ref, watch } from 'vue'
import { Clock, Calendar, Play, RefreshCw, List } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import Button from '@/components/ui/Button.vue'
import CodeEditor from '@/components/editor/CodeEditor.vue'
import ToolWorkspace from '@/components/workspace/ToolWorkspace.vue'
import { convertTimestamp, getCurrentTimestamp, batchConvertTimestamps, getTimeZones, type TimestampInfo, type BatchResult } from '@/tools/modules/timestamp'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { useHistory } from '@/composables/useHistory'
import { useToolTab } from '@/composables/useToolTab'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { copy } = useClipboard()
const { error, success } = useToast()
const { addHistory } = useHistory()

const activeTab = useToolTab('single') as any
const inputText = ref('')
const outputText = ref('')
const batchInput = ref('')
const batchResults = ref<BatchResult[]>([])
const timeZone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)
const timeZones = getTimeZones()
const errorMessage = ref('')

const currentResult = ref<TimestampInfo | null>(null)

function handleConvert() {
  if (!inputText.value.trim()) {
    error('请输入时间戳或时间字符串')
    return
  }
  try {
    errorMessage.value = ''
    currentResult.value = convertTimestamp(inputText.value, timeZone.value)
    outputText.value = JSON.stringify(currentResult.value, null, 2)
    addHistory('timestamp', inputText.value, outputText.value, {
      timeZone: timeZone.value
    })
  } catch (e: any) {
    errorMessage.value = e.message
    currentResult.value = null
    error(e.message)
  }
}

function handleCurrentTime() {
  try {
    errorMessage.value = ''
    currentResult.value = getCurrentTimestamp(timeZone.value)
    inputText.value = currentResult.value.unixSec.toString()
    outputText.value = JSON.stringify(currentResult.value, null, 2)
    success('已获取当前时间')
  } catch (e: any) {
    error(e.message)
  }
}

function handleBatchConvert() {
  if (!batchInput.value.trim()) {
    error('请输入时间戳')
    return
  }
  try {
    batchResults.value = batchConvertTimestamps(batchInput.value, timeZone.value)
    addHistory('timestamp', batchInput.value, JSON.stringify(batchResults.value), {
      mode: 'batch',
      timeZone: timeZone.value
    })
  } catch (e: any) {
    error(e.message)
  }
}

function handleClear() {
  inputText.value = ''
  outputText.value = ''
  batchInput.value = ''
  batchResults.value = []
  errorMessage.value = ''
  currentResult.value = null
}

function handleSwap() {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  errorMessage.value = ''
}

function handleCopy() {
  if (activeTab.value === 'single' && outputText.value) {
    copy(outputText.value)
  } else if (activeTab.value === 'batch' && batchResults.value.length > 0) {
    const text = batchResults.value
      .map(r => r.result ? `${r.input} → ${r.result.unixSec} / ${r.result.localString}` : `${r.input} → 错误: ${r.error}`)
      .join('\n')
    copy(text)
  }
}

function handleRestore(item: any) {
  inputText.value = item.input || ''
  outputText.value = item.output || ''
  if (item.options?.timeZone) {
    timeZone.value = item.options.timeZone
  }
  if (inputText.value && outputText.value) {
    try {
      const parsed = JSON.parse(outputText.value)
      if (parsed.unixSec !== undefined) {
        currentResult.value = parsed
      }
    } catch {
      // ignore
    }
  }
}

function copyField(value: string) {
  copy(value)
  success('已复制')
}

useKeyboardShortcuts({
  onCopy: handleCopy,
  onSwap: handleSwap,
  onClear: handleClear
})

watch(inputText, () => {
  errorMessage.value = ''
})
</script>

<template>
  <div class="h-full flex flex-col">
    <Tabs v-model="activeTab" class="mb-4">
      <TabsList>
        <TabsTrigger value="single">
          <Clock class="w-4 h-4 mr-2" />
          单条转换
        </TabsTrigger>
        <TabsTrigger value="batch">
          <List class="w-4 h-4 mr-2" />
          批量转换
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div class="mb-4 flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <label class="text-sm text-foreground">时区:</label>
        <select
          v-model="timeZone"
          class="h-8 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option v-for="tz in timeZones" :key="tz" :value="tz">{{ tz }}</option>
        </select>
      </div>
      <Button size="sm" @click="handleCurrentTime">
        <Calendar class="w-4 h-4 mr-1" />
        当前时间
      </Button>
    </div>

    <div v-show="activeTab === 'single'" class="flex-1 min-h-0">
      <ToolWorkspace
        class="h-full"
        tool-id="timestamp"
        layout="vertical"
        @clear="handleClear"
        @swap="handleSwap"
        @copy="handleCopy"
        @restore="handleRestore"
      >
        <template #input>
          <div class="h-full flex flex-col">
            <div class="flex gap-2 mb-3">
              <Button size="sm" @click="handleConvert">
                <Play class="w-4 h-4 mr-1" />
                转换
              </Button>
              <Button size="sm" variant="outline" @click="handleCurrentTime">
                <RefreshCw class="w-4 h-4 mr-1" />
                现在
              </Button>
            </div>

            <p class="text-xs text-muted-foreground mb-2">
              支持: Unix 秒(10位) / 毫秒(13位) / ISO8601 / 本地时间字符串
            </p>

            <div class="flex-1 min-h-0">
              <CodeEditor v-model="inputText" lang="text" placeholder="输入时间戳，如: 1717209600 或 2024-06-01T12:00:00" />
            </div>

            <p v-if="errorMessage" class="mt-2 text-sm text-red-500">
              {{ errorMessage }}
            </p>
          </div>
        </template>

        <template #output>
          <div class="h-full flex flex-col">
            <div v-if="currentResult" class="mb-3 space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <div class="p-2 bg-muted/30 rounded-md border border-border">
                  <p class="text-xs text-muted-foreground mb-1">Unix 秒</p>
                  <p class="font-mono text-sm cursor-pointer hover:text-primary" @click="copyField(currentResult.unixSec.toString())">
                    {{ currentResult.unixSec }}
                  </p>
                </div>
                <div class="p-2 bg-muted/30 rounded-md border border-border">
                  <p class="text-xs text-muted-foreground mb-1">Unix 毫秒</p>
                  <p class="font-mono text-sm cursor-pointer hover:text-primary" @click="copyField(currentResult.unixMs.toString())">
                    {{ currentResult.unixMs }}
                  </p>
                </div>
                <div class="p-2 bg-muted/30 rounded-md border border-border">
                  <p class="text-xs text-muted-foreground mb-1">本地时间</p>
                  <p class="font-mono text-sm cursor-pointer hover:text-primary" @click="copyField(currentResult.localString)">
                    {{ currentResult.localString }}
                  </p>
                </div>
                <div class="p-2 bg-muted/30 rounded-md border border-border">
                  <p class="text-xs text-muted-foreground mb-1">相对时间</p>
                  <p class="font-mono text-sm cursor-pointer hover:text-primary" @click="copyField(currentResult.relativeTime)">
                    {{ currentResult.relativeTime }}
                  </p>
                </div>
              </div>
              <div class="p-2 bg-muted/30 rounded-md border border-border">
                <p class="text-xs text-muted-foreground mb-1">ISO 8601</p>
                <p class="font-mono text-sm cursor-pointer hover:text-primary break-all" @click="copyField(currentResult.iso8601)">
                  {{ currentResult.iso8601 }}
                </p>
              </div>
            </div>
            <div class="flex-1 min-h-0">
              <CodeEditor v-model="outputText" lang="json" :readonly="true" placeholder="转换结果..." />
            </div>
          </div>
        </template>
      </ToolWorkspace>
    </div>

    <div v-show="activeTab === 'batch'" class="flex-1 min-h-0 flex flex-col">
      <div class="mb-3">
        <Button size="sm" @click="handleBatchConvert">
          <Play class="w-4 h-4 mr-1" />
          批量转换
        </Button>
        <p class="text-xs text-muted-foreground mt-1">每行一个时间戳</p>
      </div>

      <div class="flex gap-4 flex-1 min-h-0">
        <div class="flex-1 min-w-0 flex flex-col">
          <label class="text-sm font-medium mb-2">输入</label>
          <CodeEditor v-model="batchInput" lang="text" placeholder="每行一个时间戳..." class="flex-1 min-h-0" />
        </div>
        <div class="flex-1 min-w-0 flex flex-col">
          <label class="text-sm font-medium mb-2">结果</label>
          <div v-if="batchResults.length > 0" class="flex-1 min-h-0 overflow-auto bg-muted/30 rounded-lg border border-border">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-muted z-10">
                <tr class="border-b border-border">
                  <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">输入</th>
                  <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">时间</th>
                  <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Unix 秒</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in batchResults" :key="i" class="border-b border-border/50 last:border-0">
                  <td class="py-2 px-3 font-mono text-xs">{{ r.input }}</td>
                  <td v-if="r.result" class="py-2 px-3 text-xs">{{ r.result.localString }}</td>
                  <td v-else class="py-2 px-3 text-xs text-red-500">{{ r.error }}</td>
                  <td v-if="r.result" class="py-2 px-3 font-mono text-xs">{{ r.result.unixSec }}</td>
                  <td v-else class="py-2 px-3">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="flex-1 min-h-0 flex items-center justify-center text-muted-foreground text-sm">
            输入时间戳后点击转换
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
