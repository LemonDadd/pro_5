<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Link, Search } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import Switch from '@/components/ui/Switch.vue'
import Button from '@/components/ui/Button.vue'
import CodeEditor from '@/components/editor/CodeEditor.vue'
import ToolWorkspace from '@/components/workspace/ToolWorkspace.vue'
import { encodeUrl, decodeUrl, batchEncodeUrl, batchDecodeUrl, parseUrl, type ParsedUrl } from '@/tools/modules/url'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { useHistory } from '@/composables/useHistory'
import { useToolTab } from '@/composables/useToolTab'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { t } = useI18n()
const { copy } = useClipboard()
const { error } = useToast()
const { addHistory } = useHistory()

const activeTab = useToolTab('encode') as any
const batchMode = ref(false)
const inputText = ref('')
const outputText = ref('')
const errorMessage = ref('')
const parsedUrl = ref<ParsedUrl | null>(null)

function handleEncode() {
  try {
    errorMessage.value = ''
    if (batchMode.value) {
      outputText.value = batchEncodeUrl(inputText.value)
    } else {
      outputText.value = encodeUrl(inputText.value)
    }
    addHistory('url', inputText.value, outputText.value, {
      mode: 'encode',
      batch: batchMode.value
    })
  } catch (e: any) {
    errorMessage.value = e.message
    error(e.message)
  }
}

function handleDecode() {
  try {
    errorMessage.value = ''
    if (batchMode.value) {
      outputText.value = batchDecodeUrl(inputText.value)
    } else {
      outputText.value = decodeUrl(inputText.value)
    }
    addHistory('url', inputText.value, outputText.value, {
      mode: 'decode',
      batch: batchMode.value
    })
  } catch (e: any) {
    errorMessage.value = e.message
    error(e.message)
  }
}

function handleParse() {
  try {
    errorMessage.value = ''
    parsedUrl.value = parseUrl(inputText.value)
  } catch (e: any) {
    errorMessage.value = e.message
    parsedUrl.value = null
    error(e.message)
  }
}

function handleClear() {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
  parsedUrl.value = null
}

function handleSwap() {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  errorMessage.value = ''
}

function handleCopy() {
  if (activeTab.value === 'encode' && outputText.value) {
    copy(outputText.value)
  }
}

function handleRestore(item: any) {
  inputText.value = item.input || ''
  outputText.value = item.output || ''
  if (item.options?.batch !== undefined) {
    batchMode.value = item.options.batch
  }
  if (item.options?.mode === 'parse' && parsedUrl.value === null) {
    handleParse()
  }
}

useKeyboardShortcuts({
  onCopy: handleCopy,
  onSwap: handleSwap,
  onClear: handleClear
})

const parseFields = computed(() => {
  if (!parsedUrl.value) return []
  return [
    { key: 'protocol', label: t('tools.url.protocol'), value: parsedUrl.value.protocol },
    { key: 'host', label: t('tools.url.host'), value: parsedUrl.value.host },
    { key: 'hostname', label: t('tools.url.hostname'), value: parsedUrl.value.hostname },
    { key: 'port', label: t('tools.url.port'), value: parsedUrl.value.port || '-' },
    { key: 'pathname', label: t('tools.url.pathname'), value: parsedUrl.value.pathname },
    { key: 'search', label: t('tools.url.search'), value: parsedUrl.value.search || '-' },
    { key: 'hash', label: t('tools.url.hash'), value: parsedUrl.value.hash || '-' },
    { key: 'origin', label: t('tools.url.origin'), value: parsedUrl.value.origin }
  ]
})
</script>

<template>
  <div class="h-full flex flex-col">
    <Tabs v-model="activeTab" class="mb-4">
      <TabsList>
        <TabsTrigger value="encode">
          <Link class="w-4 h-4 mr-2" />
          {{ t('common.encode') }} / {{ t('common.decode') }}
        </TabsTrigger>
        <TabsTrigger value="parse">
          <Search class="w-4 h-4 mr-2" />
          {{ t('tools.url.parse') }}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div v-if="activeTab === 'encode'" class="flex-1 min-h-0">
      <ToolWorkspace
        class="h-full"
        tool-id="url"
        layout="horizontal"
        @clear="handleClear"
        @swap="handleSwap"
        @copy="handleCopy"
        @restore="handleRestore"
      >
        <template #input>
          <div class="h-full flex flex-col">
            <div class="flex items-center gap-4 mb-3">
              <div class="flex items-center gap-2">
                <Switch v-model="batchMode" id="batchMode" />
                <label for="batchMode" class="text-sm text-foreground cursor-pointer">
                  {{ t('tools.url.batch') }}
                </label>
              </div>
            </div>

            <p v-if="batchMode" class="text-xs text-muted-foreground mb-2">
              {{ t('tools.url.batchTip') }}
            </p>

            <div class="flex gap-2 mb-3">
              <Button size="sm" @click="handleEncode">
                {{ t('common.encode') }}
              </Button>
              <Button size="sm" variant="outline" @click="handleDecode">
                {{ t('common.decode') }}
              </Button>
            </div>

            <div class="flex-1 min-h-0">
              <CodeEditor v-model="inputText" lang="text" placeholder="输入 URL 或文本..." />
            </div>

            <p v-if="errorMessage" class="mt-2 text-sm text-red-500">
              {{ errorMessage }}
            </p>
          </div>
        </template>

        <template #output>
          <CodeEditor v-model="outputText" lang="text" :readonly="true" placeholder="输出结果..." />
        </template>
      </ToolWorkspace>
    </div>

    <div v-else class="flex-1 min-h-0 flex flex-col">
      <div class="mb-3">
        <Button size="sm" @click="handleParse">
          {{ t('tools.url.parse') }}
        </Button>
      </div>

      <div class="flex gap-4 flex-1 min-h-0">
        <div class="flex-1 min-w-0 flex flex-col">
          <label class="text-sm font-medium mb-2">{{ t('common.input') }}</label>
          <CodeEditor
            v-model="inputText"
            lang="text"
            placeholder="https://example.com/path?query=value"
            class="flex-1 min-h-0"
          />
          <p v-if="errorMessage" class="mt-2 text-sm text-red-500">
            {{ errorMessage }}
          </p>
        </div>

        <div class="flex-1 min-w-0 flex flex-col">
          <label class="text-sm font-medium mb-2">{{ t('tools.url.parsedUrl') }}</label>
          <div v-if="parsedUrl" class="flex-1 min-h-0 overflow-auto bg-muted/30 rounded-lg border border-border">
            <table class="w-full text-sm">
              <tbody>
                <tr
                  v-for="field in parseFields"
                  :key="field.key"
                  class="border-b border-border last:border-0"
                >
                  <td class="py-2 px-3 font-medium text-muted-foreground w-24 align-top">
                    {{ field.label }}
                  </td>
                  <td class="py-2 px-3 text-foreground break-all">
                    {{ field.value }}
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="parsedUrl.searchParams && Object.keys(parsedUrl.searchParams).length > 0" class="border-t border-border p-3">
              <p class="text-xs font-medium text-muted-foreground mb-2">查询参数</p>
              <table class="w-full text-xs">
                <tbody>
                  <tr
                    v-for="(value, key) in parsedUrl.searchParams"
                    :key="key"
                    class="border-b border-border/50 last:border-0"
                  >
                    <td class="py-1.5 pr-3 font-mono text-muted-foreground">{{ key }}</td>
                    <td class="py-1.5 text-foreground break-all">{{ value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="flex-1 min-h-0 flex items-center justify-center text-muted-foreground text-sm">
            输入 URL 后点击解析
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
