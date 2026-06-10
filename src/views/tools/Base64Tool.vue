<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileText, FileUp, Download, Sparkles } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import Switch from '@/components/ui/Switch.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import CodeEditor from '@/components/editor/CodeEditor.vue'
import ToolWorkspace from '@/components/workspace/ToolWorkspace.vue'
import { encodeBase64, decodeBase64, looksLikeBase64, fileToBase64, base64ToBlob } from '@/tools/modules/base64'
import { formatBytes } from '@/utils/string'
import { useToolTab } from '@/composables/useToolTab'
import { useToolIO, type HistoryItem } from '@/composables/useToolIO'

const { t } = useI18n()

type Base64Mode = 'text' | 'file'
const mode = useToolTab<Base64Mode>('text')
const urlSafe = ref(false)
const mimeWrap = ref(false)
const showAutoDetect = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const fileBase64 = ref('')
const isDragOver = ref(false)

const {
  inputText,
  outputText,
  errorMessage,
  handleClear,
  handleSwap,
  handleCopy,
  handleRestore,
  addHistory,
  setError,
  clearError,
  success,
  copy
} = useToolIO({
  toolId: 'base64',
  onClear: () => {
    showAutoDetect.value = false
    selectedFile.value = null
    fileBase64.value = ''
  },
  onSwap: () => {
    checkAutoDetect()
  },
  onRestore: (item: HistoryItem) => {
    if (item.options) {
      if (typeof item.options.urlSafe === 'boolean') {
        urlSafe.value = item.options.urlSafe
      }
      if (typeof item.options.mimeWrap === 'boolean') {
        mimeWrap.value = item.options.mimeWrap
      }
    }
  }
})

function handleEncode() {
  try {
    clearError()
    outputText.value = encodeBase64(inputText.value, {
      urlSafe: urlSafe.value,
      mimeWrap: mimeWrap.value
    })
    addHistory(inputText.value, outputText.value, {
      mode: 'encode',
      urlSafe: urlSafe.value,
      mimeWrap: mimeWrap.value
    })
  } catch (e: any) {
    setError(e.message)
  }
}

function handleDecode() {
  try {
    clearError()
    outputText.value = decodeBase64(inputText.value, {
      urlSafe: urlSafe.value
    })
    showAutoDetect.value = false
    addHistory(inputText.value, outputText.value, {
      mode: 'decode',
      urlSafe: urlSafe.value
    })
  } catch (e: any) {
    setError(e.message)
  }
}

function checkAutoDetect() {
  if (mode.value === 'text' && inputText.value.trim()) {
    showAutoDetect.value = looksLikeBase64(inputText.value.trim())
  } else {
    showAutoDetect.value = false
  }
}

watch(inputText, () => {
  checkAutoDetect()
  clearError()
})

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

async function processFile(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    setError('文件大小不能超过 5MB')
    return
  }
  selectedFile.value = file
  try {
    fileBase64.value = await fileToBase64(file)
    success('文件编码成功')
  } catch (e: any) {
    setError(e.message || '文件编码失败')
  }
}

function downloadDecodedFile() {
  if (!fileBase64.value && !outputText.value) return
  const base64 = fileBase64.value || outputText.value
  try {
    const blob = base64ToBlob(base64, selectedFile.value?.type || 'application/octet-stream')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = selectedFile.value?.name || 'decoded.bin'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e: any) {
    setError(e.message || '解码失败')
  }
}

function copyFileBase64() {
  if (fileBase64.value) {
    copy(fileBase64.value)
  }
}
</script>

<template>
  <ToolWorkspace
    class="h-full"
    tool-id="base64"
    layout="horizontal"
    @clear="handleClear"
    @swap="handleSwap"
    @copy="handleCopy"
    @restore="handleRestore"
  >
    <template #toolbar>
      <Tabs v-model="mode" class="w-full">
        <TabsList>
          <TabsTrigger value="text">
            <FileText class="w-4 h-4 mr-2" />
            {{ t('tools.base64.textMode') }}
          </TabsTrigger>
          <TabsTrigger value="file">
            <FileUp class="w-4 h-4 mr-2" />
            {{ t('tools.base64.fileMode') }}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </template>

    <template #input>
      <div v-if="mode === 'text'" class="h-full flex flex-col">
        <div v-if="showAutoDetect" class="mb-2">
          <Badge variant="info" class="cursor-pointer" @click="handleDecode">
            <Sparkles class="w-3 h-3 mr-1" />
            {{ t('tools.base64.autoDetect') }}
            <span class="ml-1 underline">{{ t('tools.base64.decodeNow') }}</span>
          </Badge>
        </div>

        <div class="flex flex-wrap items-center gap-4 mb-3">
          <div class="flex items-center gap-2">
            <Switch v-model="urlSafe" id="urlSafe" />
            <label for="urlSafe" class="text-sm text-foreground cursor-pointer">
              {{ t('tools.base64.urlSafe') }}
            </label>
          </div>
          <div class="flex items-center gap-2">
            <Switch v-model="mimeWrap" id="mimeWrap" />
            <label for="mimeWrap" class="text-sm text-foreground cursor-pointer">
              {{ t('tools.base64.mimeWrap') }}
            </label>
          </div>
        </div>

        <div class="flex gap-2 mb-3">
          <Button size="sm" @click="handleEncode">
            {{ t('common.encode') }}
          </Button>
          <Button size="sm" variant="outline" @click="handleDecode">
            {{ t('common.decode') }}
          </Button>
        </div>

        <div class="flex-1 min-h-0">
          <CodeEditor v-model="inputText" lang="text" placeholder="输入文本..." />
        </div>

        <p v-if="errorMessage" class="mt-2 text-sm text-red-500">
          {{ errorMessage }}
        </p>
      </div>

      <div v-else class="h-full flex flex-col">
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          @change="handleFileSelect"
        />

        <div
          class="flex-1 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
          :class="{ 'border-primary/50 bg-primary/5': isDragOver }"
          @click="fileInput?.click()"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <FileUp class="w-12 h-12 text-muted-foreground mb-3" />
          <p class="text-sm text-foreground mb-1">{{ t('tools.base64.dropFile') }}</p>
          <p class="text-xs text-muted-foreground">{{ t('tools.base64.fileSizeLimit') }}</p>
        </div>

        <div v-if="selectedFile" class="mt-4 p-3 bg-muted rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium truncate">{{ selectedFile.name }}</span>
            <span class="text-xs text-muted-foreground">{{ formatBytes(selectedFile.size) }}</span>
          </div>
          <div class="flex gap-2">
            <Button size="sm" variant="outline" @click="copyFileBase64">
              {{ t('common.copy') }}
            </Button>
            <Button size="sm" @click="downloadDecodedFile">
              <Download class="w-4 h-4 mr-1" />
              {{ t('tools.base64.download') }}
            </Button>
          </div>
        </div>
      </div>
    </template>

    <template #output>
      <div class="h-full flex flex-col">
        <div v-if="mode === 'text'">
          <CodeEditor v-model="outputText" lang="text" :readonly="true" placeholder="输出结果..." />
        </div>
        <div v-else class="h-full flex flex-col">
          <p class="text-sm font-medium mb-2">Base64 结果</p>
          <CodeEditor v-model="fileBase64" lang="text" :readonly="true" class="flex-1 min-h-0" />
        </div>
      </div>
    </template>
  </ToolWorkspace>
</template>
