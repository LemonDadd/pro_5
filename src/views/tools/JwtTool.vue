<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { KeyRound, AlertTriangle, Calendar, ShieldAlert } from 'lucide-vue-next'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import Button from '@/components/ui/Button.vue'
import CodeEditor from '@/components/editor/CodeEditor.vue'
import { parseJwt, formatTimestamp, type ParsedJwt } from '@/tools/modules/jwt'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { useHistory, type HistoryItem } from '@/composables/useHistory'
import { useToolTab } from '@/composables/useToolTab'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import HistoryPanel from '@/components/workspace/HistoryPanel.vue'
import { Clock } from 'lucide-vue-next'

const { t } = useI18n()
const { copy } = useClipboard()
const { error } = useToast()
const { addHistory } = useHistory()

const inputToken = ref('')
const parsedJwt = ref<ParsedJwt | null>(null)
const parseError = ref('')
const activeTab = useToolTab('payload') as any
const historyVisible = ref(false)

function handleParse() {
  try {
    parseError.value = ''
    parsedJwt.value = parseJwt(inputToken.value)
    if (parsedJwt.value) {
      addHistory('jwt', inputToken.value, parsedJwt.value.payloadJson, {
        mode: 'parse'
      })
    }
  } catch (e: any) {
    parseError.value = e.message
    parsedJwt.value = null
    error(e.message)
  }
}

function handleClear() {
  inputToken.value = ''
  parsedJwt.value = null
  parseError.value = ''
}

function handleRestore(item: HistoryItem) {
  inputToken.value = item.input || ''
  if (inputToken.value.trim()) {
    handleParse()
  }
}

function handleJwtCopy() {
  if (activeTab.value === 'header') {
    copyHeader()
  } else {
    copyPayload()
  }
}

function handleJwtSwap() {
  // JWT 不适用交换功能
}

useKeyboardShortcuts({
  onCopy: handleJwtCopy,
  onSwap: handleJwtSwap,
  onClear: handleClear
})

function copyHeader() {
  if (parsedJwt.value) {
    copy(parsedJwt.value.headerJson)
  }
}

function copyPayload() {
  if (parsedJwt.value) {
    copy(parsedJwt.value.payloadJson)
  }
}

const expTime = computed(() => {
  if (!parsedJwt.value?.payload.exp) return null
  return formatTimestamp(parsedJwt.value.payload.exp)
})

const iatTime = computed(() => {
  if (!parsedJwt.value?.payload.iat) return null
  return formatTimestamp(parsedJwt.value.payload.iat)
})

const nbfTime = computed(() => {
  if (!parsedJwt.value?.payload.nbf) return null
  return formatTimestamp(parsedJwt.value.payload.nbf)
})

watch(inputToken, () => {
  if (inputToken.value.trim()) {
    handleParse()
  } else {
    parsedJwt.value = null
    parseError.value = ''
  }
})
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium">JWT Token</label>
        <Button size="sm" variant="ghost" class="h-7 px-2 text-xs" @click="historyVisible = true">
          <Clock class="w-3.5 h-3.5 mr-1" />
          {{ t('app.recent') }}
        </Button>
      </div>
      <CodeEditor v-model="inputToken" lang="text" placeholder="粘贴 JWT 令牌..." class="h-28" />
      <div class="flex gap-2 mt-2">
        <Button size="sm" @click="handleParse">
          {{ t('common.format') }}
        </Button>
        <Button size="sm" variant="outline" @click="handleClear">
          {{ t('common.clear') }}
        </Button>
      </div>
      <p v-if="parseError" class="mt-2 text-sm text-red-500">
        {{ parseError }}
      </p>
    </div>

    <div v-if="parsedJwt" class="flex-1 min-h-0 flex flex-col">
      <div v-if="parsedJwt.isExpired || parsedJwt.isAlgNone" class="mb-4">
        <div v-if="parsedJwt.isExpired" class="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-2">
          <AlertTriangle class="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p class="text-sm font-medium text-red-600 dark:text-red-400">
              {{ t('tools.jwt.expired') }}
            </p>
            <p v-if="expTime" class="text-xs text-red-500/80">
              {{ t('tools.jwt.expiresAt') }}: {{ expTime }}
            </p>
          </div>
        </div>

        <div v-if="parsedJwt.isAlgNone" class="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <ShieldAlert class="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div>
            <p class="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              {{ t('tools.jwt.algNoneWarning') }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="parsedJwt.payload.exp || parsedJwt.payload.iat || parsedJwt.payload.nbf" class="mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <h4 class="text-sm font-medium mb-2 flex items-center gap-2">
          <Clock class="w-4 h-4" />
          时间信息
        </h4>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div v-if="expTime" class="flex items-center gap-2">
            <Calendar class="w-3.5 h-3.5 text-muted-foreground" />
            <span class="text-muted-foreground">{{ t('tools.jwt.expiresAt') }}:</span>
            <span :class="parsedJwt.isExpired ? 'text-red-500' : 'text-foreground'">{{ expTime }}</span>
          </div>
          <div v-if="iatTime" class="flex items-center gap-2">
            <Calendar class="w-3.5 h-3.5 text-muted-foreground" />
            <span class="text-muted-foreground">{{ t('tools.jwt.issuedAt') }}:</span>
            <span class="text-foreground">{{ iatTime }}</span>
          </div>
          <div v-if="nbfTime" class="flex items-center gap-2">
            <Calendar class="w-3.5 h-3.5 text-muted-foreground" />
            <span class="text-muted-foreground">{{ t('tools.jwt.notBefore') }}:</span>
            <span class="text-foreground">{{ nbfTime }}</span>
          </div>
        </div>
      </div>

      <div class="flex-1 min-h-0 flex flex-col">
        <Tabs v-model="activeTab">
          <TabsList>
            <TabsTrigger value="header">
              {{ t('tools.jwt.header') }}
            </TabsTrigger>
            <TabsTrigger value="payload">
              {{ t('tools.jwt.payload') }}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div class="flex-1 min-h-0 mt-2 relative">
          <Button
            v-if="activeTab === 'header'"
            size="sm"
            variant="ghost"
            class="absolute top-2 right-2 z-10 h-7"
            @click="copyHeader"
          >
            {{ t('common.copy') }}
          </Button>
          <Button
            v-if="activeTab === 'payload'"
            size="sm"
            variant="ghost"
            class="absolute top-2 right-2 z-10 h-7"
            @click="copyPayload"
          >
            {{ t('common.copy') }}
          </Button>

          <CodeEditor
            v-if="activeTab === 'header'"
            :model-value="parsedJwt.headerJson"
            lang="json"
            :readonly="true"
            class="h-full"
          />
          <CodeEditor
            v-if="activeTab === 'payload'"
            :model-value="parsedJwt.payloadJson"
            lang="json"
            :readonly="true"
            class="h-full"
          />
        </div>
      </div>

      <div class="mt-4">
        <h4 class="text-sm font-medium mb-2">{{ t('tools.jwt.signature') }}</h4>
        <div class="p-2 bg-muted/30 rounded-lg border border-border font-mono text-xs break-all text-muted-foreground">
          {{ parsedJwt.signature }}
        </div>
      </div>
    </div>

    <div
      v-else-if="!inputToken.trim()"
      class="flex-1 min-h-0 flex items-center justify-center text-muted-foreground"
    >
      <div class="text-center">
        <KeyRound class="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p class="text-sm">粘贴 JWT 令牌以解析</p>
      </div>
    </div>

    <HistoryPanel
      tool-id="jwt"
      v-model:visible="historyVisible"
      @restore="handleRestore"
    />
  </div>
</template>
