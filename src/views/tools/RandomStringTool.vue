<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Shuffle, Key, Info } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import Switch from '@/components/ui/Switch.vue'
import Button from '@/components/ui/Button.vue'
import CodeEditor from '@/components/editor/CodeEditor.vue'
import ToolWorkspace from '@/components/workspace/ToolWorkspace.vue'
import { generateMultipleStrings, calculatePasswordStrength, getDefaultCharSetOptions, type CharSetOptions, type PasswordStrength } from '@/tools/modules/randomString'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { useHistory } from '@/composables/useHistory'
import { useToolTab } from '@/composables/useToolTab'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { copy } = useClipboard()
const { error, success } = useToast()
const { addHistory } = useHistory()

const activeTab = useToolTab('generate') as any
const length = ref(16)
const count = ref(10)
const charOptions = ref<CharSetOptions>(getDefaultCharSetOptions())
const outputText = ref('')
const testPassword = ref('')
const testResult = ref<PasswordStrength | null>(null)

function handleGenerate() {
  try {
    const strings = generateMultipleStrings(count.value, length.value, charOptions.value)
    outputText.value = strings.join('\n')
    addHistory('random-string', '', outputText.value, {
      length: length.value,
      count: count.value,
      options: { ...charOptions.value }
    })
    success(`已生成 ${count.value} 个随机字符串`)
  } catch (e: any) {
    error(e.message)
  }
}

function handleCheckStrength() {
  if (!testPassword.value.trim()) {
    error('请输入要测试的密码')
    return
  }
  testResult.value = calculatePasswordStrength(testPassword.value)
}

function handleClear() {
  outputText.value = ''
  testPassword.value = ''
  testResult.value = null
}

function handleSwap() {
  const temp = outputText.value
  outputText.value = testPassword.value
  testPassword.value = temp
}

function handleCopy() {
  if (activeTab.value === 'generate' && outputText.value) {
    copy(outputText.value)
  } else if (activeTab.value === 'strength' && testResult.value) {
    copy(`密码强度: ${testResult.value.label}\n熵: ${testResult.value.entropy.toFixed(1)} 位`)
  }
}

function handleRestore(item: any) {
  if (item.options?.length) {
    length.value = item.options.length
  }
  if (item.options?.count) {
    count.value = item.options.count
  }
  if (item.options?.options) {
    charOptions.value = { ...item.options.options }
  }
  outputText.value = item.output || ''
}

const selectedCount = computed(() => {
  let count = 0
  if (charOptions.value.lowercase) count++
  if (charOptions.value.uppercase) count++
  if (charOptions.value.numbers) count++
  if (charOptions.value.symbols) count++
  return count
})

const canGenerate = computed(() => selectedCount.value > 0)

const entropyBits = computed(() => {
  if (!canGenerate.value) return 0
  let poolSize = 0
  if (charOptions.value.lowercase) poolSize += charOptions.value.excludeAmbiguous ? 24 : 26
  if (charOptions.value.uppercase) poolSize += charOptions.value.excludeAmbiguous ? 24 : 26
  if (charOptions.value.numbers) poolSize += charOptions.value.excludeAmbiguous ? 8 : 10
  if (charOptions.value.symbols) poolSize += 32
  return (length.value * Math.log2(Math.max(poolSize, 1))).toFixed(1)
})

useKeyboardShortcuts({
  onCopy: handleCopy,
  onSwap: handleSwap,
  onClear: handleClear
})

watch(testPassword, () => {
  if (testPassword.value) {
    testResult.value = calculatePasswordStrength(testPassword.value)
  } else {
    testResult.value = null
  }
})
</script>

<template>
  <div class="h-full flex flex-col">
    <Tabs v-model="activeTab" class="mb-4">
      <TabsList>
        <TabsTrigger value="generate">
          <Shuffle class="w-4 h-4 mr-2" />
          生成
        </TabsTrigger>
        <TabsTrigger value="strength">
          <Key class="w-4 h-4 mr-2" />
          强度检测
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div v-show="activeTab === 'generate'" class="flex-1 min-h-0">
      <ToolWorkspace
        class="h-full"
        tool-id="random-string"
        layout="vertical"
        @clear="handleClear"
        @swap="handleSwap"
        @copy="handleCopy"
        @restore="handleRestore"
      >
        <template #input>
          <div class="h-full flex flex-col">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="flex items-center gap-2">
                <label class="text-sm text-foreground whitespace-nowrap">长度:</label>
                <input
                  type="number"
                  v-model.number="length"
                  min="1"
                  max="1024"
                  class="h-8 w-full px-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div class="flex items-center gap-2">
                <label class="text-sm text-foreground whitespace-nowrap">数量:</label>
                <input
                  type="number"
                  v-model.number="count"
                  min="1"
                  max="100"
                  class="h-8 w-full px-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <p class="text-sm font-medium">字符集:</p>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2">
                  <Switch v-model="charOptions.lowercase" id="opt-lower" />
                  <label for="opt-lower" class="text-sm">小写字母 (a-z)</label>
                </div>
                <div class="flex items-center gap-2">
                  <Switch v-model="charOptions.uppercase" id="opt-upper" />
                  <label for="opt-upper" class="text-sm">大写字母 (A-Z)</label>
                </div>
                <div class="flex items-center gap-2">
                  <Switch v-model="charOptions.numbers" id="opt-num" />
                  <label for="opt-num" class="text-sm">数字 (0-9)</label>
                </div>
                <div class="flex items-center gap-2">
                  <Switch v-model="charOptions.symbols" id="opt-sym" />
                  <label for="opt-sym" class="text-sm">符号 (!@#$...)</label>
                </div>
                <div class="flex items-center gap-2 col-span-2">
                  <Switch v-model="charOptions.excludeAmbiguous" id="opt-ambig" />
                  <label for="opt-ambig" class="text-sm">排除易混淆字符 (0, O, I, l, 1)</label>
                </div>
              </div>
            </div>

            <div v-if="canGenerate" class="p-2 bg-muted/30 rounded-md text-xs text-muted-foreground mb-4 flex items-center gap-2">
              <Info class="w-3 h-3" />
              <span>熵: {{ entropyBits }} 位</span>
            </div>

            <Button 
              size="sm" 
              class="w-fit mb-4" 
              :disabled="!canGenerate"
              @click="handleGenerate"
            >
              <Shuffle class="w-4 h-4 mr-1" />
              生成
            </Button>

            <p v-if="!canGenerate" class="text-sm text-amber-500">
              请至少选择一种字符类型
            </p>
          </div>
        </template>

        <template #output>
          <div class="h-full flex flex-col">
            <div class="flex-1 min-h-0">
              <CodeEditor v-model="outputText" lang="text" :readonly="true" placeholder="生成的随机字符串..." />
            </div>
            <p v-if="outputText" class="mt-2 text-xs text-muted-foreground text-right">
              共 {{ outputText.split('\n').filter(l => l.trim()).length }} 条
            </p>
          </div>
        </template>
      </ToolWorkspace>
    </div>

    <div v-show="activeTab === 'strength'" class="flex-1 min-h-0">
      <ToolWorkspace
        class="h-full"
        tool-id="random-string"
        layout="vertical"
        @clear="handleClear"
        @swap="handleSwap"
        @copy="handleCopy"
        @restore="handleRestore"
      >
        <template #input>
          <div class="h-full flex flex-col">
            <Button size="sm" class="w-fit mb-4" @click="handleCheckStrength">
              <Key class="w-4 h-4 mr-1" />
              检测强度
            </Button>
            <p class="text-xs text-muted-foreground mb-2">
              输入要测试的密码，支持实时检测
            </p>
            <div class="flex-1 min-h-0">
              <CodeEditor v-model="testPassword" lang="text" placeholder="输入要测试的密码..." />
            </div>
          </div>
        </template>

        <template #output>
          <div class="h-full flex flex-col">
            <div v-if="testResult" class="mb-4">
              <div class="p-4 bg-card rounded-lg border border-border">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm text-muted-foreground">强度等级</span>
                  <span 
                    class="text-sm font-semibold"
                    :class="{
                      'text-gray-600': testResult.score === 0,
                      'text-red-500': testResult.score === 1,
                      'text-orange-500': testResult.score === 2,
                      'text-yellow-600': testResult.score === 3,
                      'text-green-500': testResult.score === 4
                    }"
                  >
                    {{ testResult.label }}
                  </span>
                </div>

                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div 
                    class="h-full transition-all duration-300"
                    :class="[
                      testResult.color,
                      {
                        'w-[20%]': testResult.score === 0,
                        'w-[40%]': testResult.score === 1,
                        'w-[60%]': testResult.score === 2,
                        'w-[80%]': testResult.score === 3,
                        'w-[100%]': testResult.score === 4
                      }
                    ]"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-muted-foreground text-xs">密码熵</p>
                    <p class="font-mono font-medium">{{ testResult.entropy.toFixed(1) }} 位</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs">密码长度</p>
                    <p class="font-mono font-medium">{{ testPassword.length }} 字符</p>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-border">
                  <p class="text-xs text-muted-foreground mb-2">建议:</p>
                  <ul class="text-xs space-y-1 text-muted-foreground">
                    <li v-if="testResult.score <= 1">• 使用至少 12 位长度</li>
                    <li v-if="testResult.score <= 2">• 混合大小写字母</li>
                    <li v-if="testResult.score <= 3">• 添加数字和特殊符号</li>
                    <li v-if="testResult.score === 4">• ✅ 密码强度很好！</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="flex-1 min-h-0">
              <CodeEditor 
                v-if="testResult"
                :model-value="`强度: ${testResult.label}\n熵: ${testResult.entropy.toFixed(1)} 位\n长度: ${testPassword.length} 字符`" 
                lang="text" 
                :readonly="true" 
                placeholder="检测结果..."
              />
              <div v-else class="h-full flex items-center justify-center text-muted-foreground text-sm">
                输入密码查看强度
              </div>
            </div>
          </div>
        </template>
      </ToolWorkspace>
    </div>
  </div>
</template>
