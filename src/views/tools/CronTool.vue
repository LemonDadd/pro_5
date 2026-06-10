<script setup lang="ts">
import { ref, watch } from 'vue'
import { Play, List, Calendar } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import Button from '@/components/ui/Button.vue'
import CodeEditor from '@/components/editor/CodeEditor.vue'
import ToolWorkspace from '@/components/workspace/ToolWorkspace.vue'
import { parseCron, getCronTemplates, formatDate, type CronInfo } from '@/tools/modules/cron'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { useHistory } from '@/composables/useHistory'
import { useToolTab } from '@/composables/useToolTab'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { copy } = useClipboard()
const { error, success } = useToast()
const { addHistory } = useHistory()

type CronTab = 'parse' | 'templates'
const activeTab = useToolTab<CronTab>('parse')
const inputText = ref('')
const outputText = ref('')
const errorMessage = ref('')
const templates = getCronTemplates()
const cronInfo = ref<CronInfo | null>(null)

function handleParse() {
  if (!inputText.value.trim()) {
    error('请输入 Cron 表达式')
    return
  }
  try {
    errorMessage.value = ''
    cronInfo.value = parseCron(inputText.value.trim())
    
    if (!cronInfo.value.isValid) {
      errorMessage.value = cronInfo.value.error || '无效的 Cron 表达式'
      outputText.value = ''
      error(errorMessage.value)
    } else {
      outputText.value = `表达式: ${cronInfo.value.expression}\n描述: ${cronInfo.value.description}\n\n下次执行时间:\n` +
        cronInfo.value.nextExecutions
          .map((d, i) => `${i + 1}. ${formatDate(d)}`)
          .join('\n')
      addHistory('cron', inputText.value, outputText.value, {})
    }
  } catch (e: any) {
    error(e.message)
    cronInfo.value = null
  }
}

function handleTemplate(template: { name: string; expression: string }) {
  inputText.value = template.expression
  success(`已选择模板: ${template.name}`)
  handleParse()
}

function handleClear() {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
  cronInfo.value = null
}

function handleSwap() {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  errorMessage.value = ''
  cronInfo.value = null
}

function handleCopy() {
  if (outputText.value) {
    copy(outputText.value)
  }
}

function handleRestore(item: any) {
  inputText.value = item.input || ''
  outputText.value = item.output || ''
  if (inputText.value) {
    handleParse()
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
        <TabsTrigger value="parse">
          <Play class="w-4 h-4 mr-2" />
          解析
        </TabsTrigger>
        <TabsTrigger value="templates">
          <List class="w-4 h-4 mr-2" />
          模板
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div v-show="activeTab === 'parse'" class="flex-1 min-h-0">
      <ToolWorkspace
        class="h-full"
        tool-id="cron"
        layout="vertical"
        @clear="handleClear"
        @swap="handleSwap"
        @copy="handleCopy"
        @restore="handleRestore"
      >
        <template #input>
          <div class="h-full flex flex-col">
            <div class="flex gap-2 mb-3">
              <Button size="sm" @click="handleParse">
                <Play class="w-4 h-4 mr-1" />
                解析
              </Button>
            </div>

            <p class="text-xs text-muted-foreground mb-2">
              支持 5 段或 6 段 Cron 表达式，如: <code class="px-1 bg-muted rounded">0 2 * * *</code>
            </p>

            <div class="mb-3">
              <p class="text-xs text-muted-foreground mb-1">格式说明:</p>
              <div class="font-mono text-xs bg-muted/30 rounded p-2 border border-border">
                <div>5 段: 分 时 日 月 周</div>
                <div>6 段: 秒 分 时 日 月 周</div>
              </div>
            </div>

            <div class="flex-1 min-h-0">
              <CodeEditor v-model="inputText" lang="text" placeholder="输入 Cron 表达式，如: 0 2 * * *" />
            </div>

            <p v-if="errorMessage" class="mt-2 text-sm text-red-500">
              {{ errorMessage }}
            </p>
          </div>
        </template>

        <template #output>
          <div class="h-full flex flex-col">
            <div v-if="cronInfo?.isValid" class="mb-3 space-y-3">
              <div class="p-3 bg-primary/5 rounded-md border border-primary/20">
                <p class="text-xs text-muted-foreground mb-1">人类语言描述</p>
                <p class="font-semibold text-primary">{{ cronInfo.description }}</p>
              </div>
              
              <div>
                <p class="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Calendar class="w-3 h-3" />
                  下 5 次执行时间
                </p>
                <div class="space-y-1">
                  <div 
                    v-for="(d, i) in cronInfo.nextExecutions" 
                    :key="i"
                    class="font-mono text-xs p-2 bg-muted/30 rounded border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                    @click="copyField(formatDate(d))"
                  >
                    {{ i + 1 }}. {{ formatDate(d) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-1 min-h-0">
              <CodeEditor v-model="outputText" lang="text" :readonly="true" placeholder="解析结果..." />
            </div>
          </div>
        </template>
      </ToolWorkspace>
    </div>

    <div v-show="activeTab === 'templates'" class="flex-1 min-h-0">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          v-for="template in templates"
          :key="template.expression"
          class="group p-4 text-left rounded-lg border border-border bg-card hover:bg-muted/50 transition-all duration-200 hover:border-primary/30"
          @click="handleTemplate(template)"
        >
          <p class="font-medium text-sm mb-1 group-hover:text-primary transition-colors">{{ template.name }}</p>
          <p class="font-mono text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1 inline-block">
            {{ template.expression }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>
