<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Code, Eye } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import Switch from '@/components/ui/Switch.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import CodeEditor from '@/components/editor/CodeEditor.vue'
import ToolWorkspace from '@/components/workspace/ToolWorkspace.vue'
import { escapeHtml, unescapeHtml } from '@/tools/modules/htmlEntity'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { useHistory } from '@/composables/useHistory'
import { useToolTab } from '@/composables/useToolTab'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { t } = useI18n()
const { copy } = useClipboard()
const { error } = useToast()
const { addHistory } = useHistory()

const inputText = ref('')
const outputText = ref('')
const useNamedEntities = ref(true)
const activeTab = useToolTab('convert') as any

const previewHtml = computed(() => {
  return unescapeHtml(outputText.value || inputText.value)
})

function handleEscape() {
  try {
    outputText.value = escapeHtml(inputText.value, useNamedEntities.value)
    addHistory('html-entity', inputText.value, outputText.value, {
      mode: 'escape',
      useNamedEntities: useNamedEntities.value
    })
  } catch (e: any) {
    error(e.message)
  }
}

function handleUnescape() {
  try {
    outputText.value = unescapeHtml(inputText.value)
    addHistory('html-entity', inputText.value, outputText.value, {
      mode: 'unescape'
    })
  } catch (e: any) {
    error(e.message)
  }
}

function handleClear() {
  inputText.value = ''
  outputText.value = ''
}

function handleSwap() {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
}

function handleCopy() {
  if (outputText.value) {
    copy(outputText.value)
  }
}

function handleRestore(item: any) {
  inputText.value = item.input || ''
  outputText.value = item.output || ''
  if (item.options?.useNamedEntities !== undefined) {
    useNamedEntities.value = item.options.useNamedEntities
  }
}

useKeyboardShortcuts({
  onCopy: handleCopy,
  onSwap: handleSwap,
  onClear: handleClear
})
</script>

<template>
  <div class="h-full flex flex-col">
    <Tabs v-model="activeTab" class="mb-4">
      <TabsList>
        <TabsTrigger value="convert">
          <Code class="w-4 h-4 mr-2" />
          {{ t('tools.htmlEntity.escape') }} / {{ t('tools.htmlEntity.unescape') }}
        </TabsTrigger>
        <TabsTrigger value="preview">
          <Eye class="w-4 h-4 mr-2" />
          {{ t('tools.htmlEntity.preview') }}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div class="flex-1 min-h-0">
      <div v-if="activeTab === 'convert'">
        <ToolWorkspace
          class="h-full"
          tool-id="html-entity"
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
                  <Switch v-model="useNamedEntities" id="useNamed" />
                  <label for="useNamed" class="text-sm text-foreground cursor-pointer">
                    使用命名实体
                  </label>
                </div>
              </div>

              <div class="flex gap-2 mb-3">
                <Button size="sm" @click="handleEscape">
                  {{ t('tools.htmlEntity.escape') }}
                </Button>
                <Button size="sm" variant="outline" @click="handleUnescape">
                  {{ t('tools.htmlEntity.unescape') }}
                </Button>
              </div>

              <div class="flex-1 min-h-0">
                <CodeEditor v-model="inputText" lang="text" placeholder="输入 HTML 或文本..." />
              </div>
            </div>
          </template>

          <template #output>
            <CodeEditor v-model="outputText" lang="text" :readonly="true" placeholder="输出结果..." />
          </template>
        </ToolWorkspace>
      </div>

      <div v-else class="h-full flex flex-col">
        <div class="mb-3 flex items-center gap-2">
          <Badge variant="warning">
            {{ t('tools.htmlEntity.previewWarning') }}
          </Badge>
        </div>

        <div class="flex-1 min-h-0">
          <iframe
            :srcdoc="previewHtml"
            sandbox=""
            class="w-full h-full bg-white rounded-lg border border-border"
            title="HTML Preview"
          />
        </div>
      </div>
    </div>
  </div>
</template>
