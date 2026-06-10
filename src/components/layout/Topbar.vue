<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Menu, Sun, Moon, Globe, Info, Star, Share2 } from 'lucide-vue-next'
import { useAppStore } from '@/stores/appStore'
import { useTheme } from '@/composables/useTheme'
import { useFavorites } from '@/composables/useFavorites'
import { useClipboard } from '@/composables/useClipboard'
import { toolRegistry } from '@/tools/registry'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/Button.vue'
import Dialog from '@/components/ui/Dialog.vue'

const { t, locale } = useI18n()
const route = useRoute()
const appStore = useAppStore()
const { isDark, toggleTheme } = useTheme()
const { isFavorite, toggleFavorite } = useFavorites()
const { copy } = useClipboard()
const { success } = useToast()

const aboutDialogOpen = ref(false)

const currentTool = computed(() => {
  const toolId = route.params.toolId as string
  return toolRegistry.getToolById(toolId)
})

const toolName = computed(() => {
  if (!currentTool.value) return ''
  return locale.value === 'zh-CN' ? currentTool.value.name.zh : currentTool.value.name.en
})

const toolDescription = computed(() => {
  if (!currentTool.value) return ''
  return locale.value === 'zh-CN' ? currentTool.value.description.zh : currentTool.value.description.en
})

function toggleLanguage() {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  localStorage.setItem('devbox_language', locale.value)
}

function shareLink() {
  const url = window.location.href
  copy(url)
  success(t('common.linkCopied'))
}

function toggleCurrentFavorite() {
  if (currentTool.value) {
    toggleFavorite(currentTool.value.id)
  }
}

const version = '1.0.0'
</script>

<template>
  <header class="flex-shrink-0 h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-3">
    <Button
      variant="ghost"
      size="icon"
      class="md:hidden"
      @click="appStore.toggleMobileSidebar()"
    >
      <Menu class="w-5 h-5" />
    </Button>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-3">
        <h2 class="font-semibold text-foreground truncate">{{ toolName || t('app.title') }}</h2>
        <div class="hidden sm:flex items-center gap-1">
          <Button
            v-if="currentTool"
            variant="ghost"
            size="icon"
            class="h-7 w-7"
            @click="toggleCurrentFavorite"
          >
            <Star
              class="w-4 h-4"
              :class="isFavorite(currentTool.id) ? 'text-yellow-500 fill-yellow-500' : ''"
            />
          </Button>
          <Button
            v-if="currentTool"
            variant="ghost"
            size="icon"
            class="h-7 w-7"
            @click="shareLink"
          >
            <Share2 class="w-4 h-4" />
          </Button>
        </div>
      </div>
      <p v-if="toolDescription" class="text-xs text-muted-foreground truncate hidden sm:block">
        {{ toolDescription }}
      </p>
    </div>

    <div class="flex items-center gap-1">
      <Button variant="ghost" size="icon" @click="toggleLanguage">
        <Globe class="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" @click="toggleTheme">
        <Sun v-if="isDark" class="w-5 h-5" />
        <Moon v-else class="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" @click="aboutDialogOpen = true">
        <Info class="w-5 h-5" />
      </Button>
    </div>

    <Dialog v-model:modelValue="aboutDialogOpen" :title="t('about.title')">
      <div class="space-y-6">
        <div>
          <h4 class="text-sm font-semibold mb-2">{{ t('about.privacyTitle') }}</h4>
          <p class="text-sm text-muted-foreground">{{ t('about.privacyContent') }}</p>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2">{{ t('about.featuresTitle') }}</h4>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li>{{ t('about.feature1') }}</li>
            <li>{{ t('about.feature2') }}</li>
            <li>{{ t('about.feature3') }}</li>
            <li>{{ t('about.feature4') }}</li>
            <li>{{ t('about.feature5') }}</li>
            <li>{{ t('about.feature6') }}</li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2">{{ t('about.techTitle') }}</h4>
          <div class="flex flex-wrap gap-2">
            <span class="px-2 py-1 text-xs bg-muted rounded-md">Vue 3</span>
            <span class="px-2 py-1 text-xs bg-muted rounded-md">TypeScript</span>
            <span class="px-2 py-1 text-xs bg-muted rounded-md">Vite</span>
            <span class="px-2 py-1 text-xs bg-muted rounded-md">Pinia</span>
            <span class="px-2 py-1 text-xs bg-muted rounded-md">Tailwind CSS</span>
            <span class="px-2 py-1 text-xs bg-muted rounded-md">CodeMirror 6</span>
          </div>
        </div>

        <div class="text-center text-xs text-muted-foreground pt-2 border-t">
          {{ t('about.version') }} {{ version }}
        </div>
      </div>
    </Dialog>
  </header>
</template>
