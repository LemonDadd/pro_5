<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Type, Smile, List } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import Button from '@/components/ui/Button.vue'
import CodeEditor from '@/components/editor/CodeEditor.vue'
import ToolWorkspace from '@/components/workspace/ToolWorkspace.vue'
import { textToUnicode, unicodeToText, getCodePoints, splitEmoji, type CodePoint, type UnicodeFormat } from '@/tools/modules/unicode'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { useHistory } from '@/composables/useHistory'
import { useToolTab } from '@/composables/useToolTab'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { t } = useI18n()
const { copy } = useClipboard()
const { error } = useToast()
const { addHistory } = useHistory()

type UnicodeTab = 'convert' | 'emoji'
const activeTab = useToolTab<UnicodeTab>('convert')
const unicodeFormat = ref<UnicodeFormat>('uXXXX')
const inputText = ref('')
const outputText = ref('')
const emojiInput = ref('')

const codePoints = computed<CodePoint[]>(() => {
  const text = activeTab.value === 'convert' ? inputText.value : emojiInput.value
  if (!text) return []
  return getCodePoints(text)
})

const emojiList = computed(() => {
  if (!emojiInput.value) return []
  return splitEmoji(emojiInput.value)
})

function handleToUnicode() {
  try {
    outputText.value = textToUnicode(inputText.value, unicodeFormat.value)
    addHistory('unicode', inputText.value, outputText.value, {
      mode: 'toUnicode',
      format: unicodeFormat.value
    })
  } catch (e: any) {
    error(e.message)
  }
}

function handleToText() {
  try {
    outputText.value = unicodeToText(inputText.value)
    addHistory('unicode', inputText.value, outputText.value, {
      mode: 'toText'
    })
  } catch (e: any) {
    error(e.message)
  }
}

function handleClear() {
  inputText.value = ''
  outputText.value = ''
  emojiInput.value = ''
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
  if (item.options?.format) {
    unicodeFormat.value = item.options.format
  }
  if (item.input) {
    emojiInput.value = item.input
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
          <Type class="w-4 h-4 mr-2" />
          {{ t('tools.unicode.toUnicode') }}
        </TabsTrigger>
        <TabsTrigger value="emoji">
          <Smile class="w-4 h-4 mr-2" />
          {{ t('tools.unicode.emoji') }}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div class="flex-1 min-h-0 overflow-auto">
      <div v-if="activeTab === 'convert'">
        <ToolWorkspace
          class="h-full"
          tool-id="unicode"
          layout="horizontal"
          @clear="handleClear"
          @swap="handleSwap"
          @copy="handleCopy"
          @restore="handleRestore"
        >
          <template #input>
            <div class="h-full flex flex-col">
              <div class="flex items-center gap-4 mb-3">
                <select
                  v-model="unicodeFormat"
                  class="h-8 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="uXXXX">\uXXXX</option>
                  <option value="uXXXXXX">\u{XXXXXX}</option>
                </select>
              </div>

              <div class="flex gap-2 mb-3">
                <Button size="sm" @click="handleToUnicode">
                  {{ t('tools.unicode.toUnicode') }}
                </Button>
                <Button size="sm" variant="outline" @click="handleToText">
                  {{ t('tools.unicode.toText') }}
                </Button>
              </div>

              <div class="flex-1 min-h-0">
                <CodeEditor v-model="inputText" lang="text" placeholder="输入文本或 Unicode..." />
              </div>
            </div>
          </template>

          <template #output>
            <CodeEditor v-model="outputText" lang="text" :readonly="true" placeholder="输出结果..." />
          </template>
        </ToolWorkspace>
      </div>

      <div v-else class="h-full flex flex-col">
        <div class="mb-3">
          <label class="text-sm font-medium mb-2 block">输入文本</label>
          <CodeEditor v-model="emojiInput" lang="text" placeholder="输入包含 Emoji 的文本..." class="h-24" />
        </div>

        <div v-if="emojiList.length > 0" class="mb-4">
          <h4 class="text-sm font-medium mb-2">{{ t('tools.unicode.emoji') }} 拆分</h4>
          <div class="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border">
            <div
              v-for="(char, index) in emojiList"
              :key="index"
              class="w-12 h-12 flex items-center justify-center text-2xl bg-background rounded-md border border-border cursor-pointer hover:border-primary/50 transition-colors"
              :title="codePoints[index]?.hex"
              @click="copy(char)"
            >
              {{ char }}
            </div>
          </div>
        </div>

        <div v-if="codePoints.length > 0" class="flex-1 min-h-0 flex flex-col">
          <h4 class="text-sm font-medium mb-2 flex items-center gap-2">
            <List class="w-4 h-4" />
            {{ t('tools.unicode.codePoints') }}
            <span class="text-xs text-muted-foreground font-normal">
              ({{ codePoints.length }} 个字符)
            </span>
          </h4>
          <div class="flex-1 min-h-0 overflow-auto bg-muted/30 rounded-lg border border-border">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-muted z-10">
                <tr class="border-b border-border">
                  <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">字符</th>
                  <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">码点</th>
                  <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">十进制</th>
                  <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">转义序列</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(cp, index) in codePoints"
                  :key="index"
                  class="border-b border-border/50 last:border-0 hover:bg-background/50"
                >
                  <td class="py-2 px-3 text-xl">{{ cp.char }}</td>
                  <td class="py-2 px-3 font-mono text-xs">{{ cp.hex }}</td>
                  <td class="py-2 px-3 font-mono text-xs text-muted-foreground">{{ cp.codePoint }}</td>
                  <td class="py-2 px-3 font-mono text-xs text-muted-foreground">{{ cp.unicodeEscape }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
