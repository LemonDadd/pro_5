<script setup lang="ts">
import { ref } from 'vue'
import { Shuffle, Key, Hash } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import Switch from '@/components/ui/Switch.vue'
import Button from '@/components/ui/Button.vue'
import CodeEditor from '@/components/editor/CodeEditor.vue'
import ToolWorkspace from '@/components/workspace/ToolWorkspace.vue'
import { generateUUIDs, generateULIDs, validateUUID, validateULID, parseULID } from '@/tools/modules/uuid'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { useHistory } from '@/composables/useHistory'
import { useToolTab } from '@/composables/useToolTab'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { copy } = useClipboard()
const { error, success, info } = useToast()
const { addHistory } = useHistory()

const activeTab = useToolTab('uuid') as any
const uuidCount = ref(5)
const uuidUppercase = ref(false)
const ulidCount = ref(5)
const uuidOutput = ref('')
const ulidOutput = ref('')
const validateInput = ref('')
const validateResult = ref('')

function handleGenerateUUID() {
  try {
    const uuids = generateUUIDs(uuidCount.value, uuidUppercase.value)
    uuidOutput.value = uuids.join('\n')
    addHistory('uuid', '', uuidOutput.value, {
      count: uuidCount.value,
      uppercase: uuidUppercase.value,
      type: 'uuid'
    })
    success(`已生成 ${uuidCount.value} 个 UUID`)
  } catch (e: any) {
    error(e.message)
  }
}

function handleGenerateULID() {
  try {
    const ulids = generateULIDs(ulidCount.value)
    ulidOutput.value = ulids.join('\n')
    addHistory('uuid', '', ulidOutput.value, {
      count: ulidCount.value,
      type: 'ulid'
    })
    success(`已生成 ${ulidCount.value} 个 ULID`)
  } catch (e: any) {
    error(e.message)
  }
}

function handleValidate() {
  const input = validateInput.value.trim()
  if (!input) {
    error('请输入 UUID 或 ULID')
    return
  }

  try {
    if (validateUUID(input)) {
      const valid = validateUUID(input)
      validateResult.value = `UUID v4: ${valid ? '✅ 有效' : '❌ 无效'}`
      info(validateResult.value)
    } else if (validateULID(input)) {
      const parsed = parseULID(input)
      validateResult.value = `ULID: ✅ 有效\n时间戳: ${parsed.timestamp}\n时间: ${parsed.date}\n随机部分: ${parsed.randomPart}`
      success('有效的 ULID')
    } else {
      validateResult.value = '❌ 不是有效的 UUID v4 或 ULID'
      error('无效的 UUID 或 ULID')
    }
  } catch (e: any) {
    validateResult.value = `❌ 错误: ${e.message}`
    error(e.message)
  }
}

function handleClear() {
  uuidOutput.value = ''
  ulidOutput.value = ''
  validateInput.value = ''
  validateResult.value = ''
}

function handleSwap() {
  const temp = uuidOutput.value
  uuidOutput.value = ulidOutput.value
  ulidOutput.value = temp
}

function handleCopy() {
  if (activeTab.value === 'uuid' && uuidOutput.value) {
    copy(uuidOutput.value)
  } else if (activeTab.value === 'ulid' && ulidOutput.value) {
    copy(ulidOutput.value)
  } else if (activeTab.value === 'validate' && validateResult.value) {
    copy(validateResult.value)
  }
}

function handleRestore(item: any) {
  if (item.options?.type === 'uuid') {
    activeTab.value = 'uuid'
    uuidCount.value = item.options?.count || 5
    uuidUppercase.value = item.options?.uppercase || false
    uuidOutput.value = item.output || ''
  } else if (item.options?.type === 'ulid') {
    activeTab.value = 'ulid'
    ulidCount.value = item.options?.count || 5
    ulidOutput.value = item.output || ''
  } else {
    activeTab.value = 'uuid'
    uuidOutput.value = item.output || ''
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
        <TabsTrigger value="uuid">
          <Key class="w-4 h-4 mr-2" />
          UUID 生成
        </TabsTrigger>
        <TabsTrigger value="ulid">
          <Hash class="w-4 h-4 mr-2" />
          ULID 生成
        </TabsTrigger>
        <TabsTrigger value="validate">
          <Shuffle class="w-4 h-4 mr-2" />
          校验
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div v-show="activeTab === 'uuid'" class="flex-1 min-h-0">
      <ToolWorkspace
        class="h-full"
        tool-id="uuid"
        layout="vertical"
        @clear="handleClear"
        @swap="handleSwap"
        @copy="handleCopy"
        @restore="handleRestore"
      >
        <template #input>
          <div class="h-full flex flex-col">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center gap-2">
                <label class="text-sm text-foreground whitespace-nowrap">数量:</label>
                <input
                  type="number"
                  v-model.number="uuidCount"
                  min="1"
                  max="50"
                  class="h-8 w-20 px-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <span class="text-xs text-muted-foreground">(1-50)</span>
              </div>
              <div class="flex items-center gap-2">
                <Switch v-model="uuidUppercase" id="uuid-uppercase" />
                <label for="uuid-uppercase" class="text-sm text-foreground">大写</label>
              </div>
            </div>

            <Button size="sm" class="w-fit mb-4" @click="handleGenerateUUID">
              <Shuffle class="w-4 h-4 mr-1" />
              生成 UUID
            </Button>

            <div class="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-700 dark:text-amber-400">
              <p class="font-medium mb-1">💡 UUID v4</p>
              <p>基于加密安全随机数生成，保证唯一性。格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</p>
            </div>
          </div>
        </template>

        <template #output>
          <div class="h-full flex flex-col">
            <div class="flex-1 min-h-0">
              <CodeEditor v-model="uuidOutput" lang="text" :readonly="true" placeholder="生成的 UUID 列表..." />
            </div>
            <p v-if="uuidOutput" class="mt-2 text-xs text-muted-foreground text-right">
              共 {{ uuidOutput.split('\n').filter(l => l.trim()).length }} 个
            </p>
          </div>
        </template>
      </ToolWorkspace>
    </div>

    <div v-show="activeTab === 'ulid'" class="flex-1 min-h-0">
      <ToolWorkspace
        class="h-full"
        tool-id="uuid"
        layout="vertical"
        @clear="handleClear"
        @swap="handleSwap"
        @copy="handleCopy"
        @restore="handleRestore"
      >
        <template #input>
          <div class="h-full flex flex-col">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center gap-2">
                <label class="text-sm text-foreground whitespace-nowrap">数量:</label>
                <input
                  type="number"
                  v-model.number="ulidCount"
                  min="1"
                  max="50"
                  class="h-8 w-20 px-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <span class="text-xs text-muted-foreground">(1-50)</span>
              </div>
            </div>

            <Button size="sm" class="w-fit mb-4" @click="handleGenerateULID">
              <Shuffle class="w-4 h-4 mr-1" />
              生成 ULID
            </Button>

            <div class="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md text-xs text-blue-700 dark:text-blue-400">
              <p class="font-medium mb-1">💡 ULID (Universally Unique Lexicographically Sortable Identifier)</p>
              <p class="mb-1">26 字符，时间戳 + 随机数，可按时间排序 (lexicographic sort)。</p>
              <p>格式: TTTTTTTTTT RR (10 字符毫秒时间戳 + 16 字符随机数，使用 Crockford Base32)</p>
            </div>
          </div>
        </template>

        <template #output>
          <div class="h-full flex flex-col">
            <div class="flex-1 min-h-0">
              <CodeEditor v-model="ulidOutput" lang="text" :readonly="true" placeholder="生成的 ULID 列表..." />
            </div>
            <p v-if="ulidOutput" class="mt-2 text-xs text-muted-foreground text-right">
              共 {{ ulidOutput.split('\n').filter(l => l.trim()).length }} 个
            </p>
          </div>
        </template>
      </ToolWorkspace>
    </div>

    <div v-show="activeTab === 'validate'" class="flex-1 min-h-0">
      <ToolWorkspace
        class="h-full"
        tool-id="uuid"
        layout="vertical"
        @clear="handleClear"
        @swap="handleSwap"
        @copy="handleCopy"
        @restore="handleRestore"
      >
        <template #input>
          <div class="h-full flex flex-col">
            <Button size="sm" class="w-fit mb-4" @click="handleValidate">
              <Shuffle class="w-4 h-4 mr-1" />
              校验
            </Button>
            <p class="text-xs text-muted-foreground mb-2">
              输入 UUID v4 或 ULID 进行校验
            </p>
            <div class="flex-1 min-h-0">
              <CodeEditor v-model="validateInput" lang="text" placeholder="输入 UUID 或 ULID..." />
            </div>
          </div>
        </template>

        <template #output>
          <div class="h-full flex flex-col">
            <div class="flex-1 min-h-0">
              <CodeEditor v-model="validateResult" lang="text" :readonly="true" placeholder="校验结果..." />
            </div>
          </div>
        </template>
      </ToolWorkspace>
    </div>
  </div>
</template>
