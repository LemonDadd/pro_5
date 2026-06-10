<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Braces, FileJson } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import Switch from '@/components/ui/Switch.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import CodeEditor from '@/components/editor/CodeEditor.vue'
import ToolWorkspace from '@/components/workspace/ToolWorkspace.vue'
import { formatJson, compressJson, validateJson, jsonToYaml, yamlToJson, type JsonError } from '@/tools/modules/json'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { useHistory } from '@/composables/useHistory'

const { t } = useI18n()
const { copy } = useClipboard()
const { error, success } = useToast()
const { addHistory } = useHistory()

const activeTab = ref<'json' | 'yaml'>('json')
const inputText = ref('')
const outputText = ref('')
const sortKeys = ref(false)
const escapeUnicode = ref(false)
const indentSize = ref(2)

const validation = computed(() => {
  if (!inputText.value.trim()) return { valid: null as boolean | null, error: null as JsonError | null }
  const result = validateJson(inputText.value)
  return { valid: result.valid, error: result.error || null }
})

function handleFormat() {
  try {
    outputText.value = formatJson(inputText.value, {
      indent: indentSize.value,
      sortKeys: sortKeys.value,
      escapeUnicode: escapeUnicode.value
    })
    addHistory('json', inputText.value, outputText.value, {
      mode: 'format',
      sortKeys: sortKeys.value,
      escapeUnicode: escapeUnicode.value,
      indent: indentSize.value
    })
  } catch (e: any) {
    error(e.message)
  }
}

function handleCompress() {
  try {
    outputText.value = compressJson(inputText.value)
    addHistory('json', inputText.value, outputText.value, {
      mode: 'compress'
    })
  } catch (e: any) {
    error(e.message)
  }
}

function handleValidate() {
  const result = validateJson(inputText.value)
  if (result.valid) {
    success(t('tools.json.valid'))
  } else {
    error(result.error?.message || t('tools.json.invalid'))
  }
}

function handleToYaml() {
  try {
    outputText.value = jsonToYaml(inputText.value)
    addHistory('json', inputText.value, outputText.value, {
      mode: 'toYaml'
    })
  } catch (e: any) {
    error(e.message)
  }
}

function handleFromYaml() {
  try {
    outputText.value = yamlToJson(inputText.value)
    addHistory('json', inputText.value, outputText.value, {
      mode: 'fromYaml'
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

const inputLang = computed(() => {
  return activeTab.value === 'yaml' ? 'text' : 'json'
})

const outputLang = computed(() => {
  if (activeTab.value === 'yaml') return 'text'
  return 'json'
})
</script>

<template>
  <div class="h-full flex flex-col">
    <Tabs v-model="activeTab" class="mb-4">
      <TabsList>
        <TabsTrigger value="json">
          <Braces class="w-4 h-4 mr-2" />
          JSON
        </TabsTrigger>
        <TabsTrigger value="yaml">
          <FileJson class="w-4 h-4 mr-2" />
          YAML
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div class="flex-1 min-h-0">
      <ToolWorkspace
        class="h-full"
        layout="horizontal"
        @clear="handleClear"
        @swap="handleSwap"
        @copy="handleCopy"
      >
        <template #input>
          <div class="h-full flex flex-col">
            <div v-if="activeTab === 'json'" class="flex flex-wrap items-center gap-3 mb-3">
              <div class="flex items-center gap-2">
                <Switch v-model="sortKeys" id="sortKeys" />
                <label for="sortKeys" class="text-sm cursor-pointer">
                  {{ t('tools.json.sortKeys') }}
                </label>
              </div>
              <div class="flex items-center gap-2">
                <Switch v-model="escapeUnicode" id="escapeUnicode" />
                <label for="escapeUnicode" class="text-sm cursor-pointer">
                  {{ t('tools.json.escapeUnicode') }}
                </label>
              </div>
              <select
                v-model="indentSize"
                class="h-7 px-2 text-xs rounded-md border border-input bg-background"
              >
                <option :value="2">2 空格</option>
                <option :value="4">4 空格</option>
              </select>
            </div>

            <div v-if="validation.valid !== null" class="mb-2">
              <Badge v-if="validation.valid" variant="success">
                {{ t('tools.json.valid') }}
              </Badge>
              <Badge v-else variant="destructive">
                {{ t('tools.json.invalid') }}
              </Badge>
            </div>

            <div class="flex gap-2 mb-3">
              <Button v-if="activeTab === 'json'" size="sm" @click="handleFormat">
                {{ t('tools.json.format') }}
              </Button>
              <Button v-if="activeTab === 'json'" size="sm" variant="outline" @click="handleCompress">
                {{ t('tools.json.compress') }}
              </Button>
              <Button v-if="activeTab === 'json'" size="sm" variant="outline" @click="handleValidate">
                {{ t('tools.json.validate') }}
              </Button>
              <Button v-if="activeTab === 'yaml'" size="sm" @click="handleFromYaml">
                YAML → JSON
              </Button>
              <Button v-if="activeTab === 'yaml'" size="sm" variant="outline" @click="handleToYaml">
                JSON → YAML
              </Button>
            </div>

            <div class="flex-1 min-h-0">
              <CodeEditor
                v-model="inputText"
                :lang="inputLang"
                placeholder="输入 JSON 或 YAML..."
              />
            </div>

            <p v-if="validation.error" class="mt-2 text-sm text-red-500">
              {{ validation.error.message }}
            </p>
          </div>
        </template>

        <template #output>
          <CodeEditor
            v-model="outputText"
            :lang="outputLang"
            :readonly="true"
            placeholder="输出结果..."
          />
        </template>
      </ToolWorkspace>
    </div>
  </div>
</template>
