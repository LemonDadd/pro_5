<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { Search, ChevronDown, ChevronRight, Star, Clock, Wrench } from 'lucide-vue-next'
import { useAppStore } from '@/stores/appStore'
import { toolRegistry, getDefaultCategoryExpanded, getCategoryDisplayOrder } from '@/tools/registry'
import { useFavorites } from '@/composables/useFavorites'
import { useHistory } from '@/composables/useHistory'
import * as Icons from 'lucide-vue-next'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const { isFavorite, toggleFavorite, getFavoriteToolIds } = useFavorites()
const { history } = useHistory()

const searchQuery = ref('')
const expandedCategories = ref<Record<string, boolean>>(getDefaultCategoryExpanded())

function ensureCategoryExpanded(category: string) {
  if (expandedCategories.value[category] === undefined) {
    const defaults = getDefaultCategoryExpanded()
    expandedCategories.value[category] = defaults[category] ?? true
  }
}

const categories = computed(() => {
  const cats = getCategoryDisplayOrder()
  cats.forEach(ensureCategoryExpanded)
  return cats
})

const toolsByCategory = computed(() => {
  const result: Record<string, ReturnType<typeof toolRegistry.getTools>> = {}
  const cats = categories.value
  cats.forEach(cat => {
    result[cat] = toolRegistry.getToolsByCategory(cat)
  })
  return result
})

const favoriteTools = computed(() => {
  const ids = getFavoriteToolIds()
  return toolRegistry.getTools().filter(t => ids.includes(t.id))
})

const recentTools = computed(() => {
  const toolIds = [...new Set(history.value.map(h => h.toolId))].slice(0, 5)
  return toolIds.map(id => toolRegistry.getToolById(id)).filter(Boolean)
})

const filteredTools = computed(() => {
  if (!searchQuery.value.trim()) return null
  return toolRegistry.searchTools(searchQuery.value)
})

function getIcon(iconName: string) {
  const iconKey = iconName as keyof typeof Icons
  return Icons[iconKey] || Icons.Wrench
}

function navigateToTool(toolId: string) {
  const tool = toolRegistry.getToolById(toolId)
  if (tool) {
    router.push(tool.path)
    appStore.closeMobileSidebar()
  }
}

function toggleCategory(category: string) {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

function isActive(toolId: string): boolean {
  return route.params.toolId === toolId
}

function getToolName(tool: any): string {
  return locale.value === 'zh-CN' ? tool.name.zh : tool.name.en
}

function handleFavoriteToggle(e: Event, toolId: string) {
  e.stopPropagation()
  toggleFavorite(toolId)
}
</script>

<template>
  <aside
    class="w-72 h-full bg-card border-r border-border flex flex-col"
  >
    <div class="p-4 border-b border-border">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Wrench class="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 class="font-semibold text-foreground">{{ t('app.title') }}</h1>
          <p class="text-xs text-muted-foreground">{{ t('app.subtitle') }}</p>
        </div>
      </div>
    </div>

    <div class="p-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('app.searchPlaceholder')"
          class="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
      <template v-if="filteredTools">
        <div v-if="filteredTools.length === 0" class="px-3 py-8 text-center text-sm text-muted-foreground">
          没有找到匹配的工具
        </div>
        <div v-else class="space-y-1">
          <button
            v-for="tool in filteredTools"
            :key="tool.id"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors"
            :class="[
              isActive(tool.id)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            ]"
            @click="navigateToTool(tool.id)"
          >
            <component :is="getIcon(tool.icon)" class="w-4 h-4 flex-shrink-0" />
            <span class="flex-1 text-left truncate">{{ getToolName(tool) }}</span>
          </button>
        </div>
      </template>

      <template v-else>
        <div v-if="favoriteTools.length > 0" class="mb-4">
          <div class="flex items-center gap-2 px-3 py-2">
            <Star class="w-4 h-4 text-yellow-500" />
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {{ t('app.favorites') }}
            </span>
          </div>
          <div class="space-y-0.5">
            <button
              v-for="tool in favoriteTools"
              :key="tool.id"
              class="w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors"
              :class="[
                isActive(tool.id)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              ]"
              @click="navigateToTool(tool.id)"
            >
              <component :is="getIcon(tool.icon)" class="w-4 h-4 flex-shrink-0" />
              <span class="flex-1 text-left truncate">{{ getToolName(tool) }}</span>
            </button>
          </div>
        </div>

        <div v-if="recentTools.length > 0" class="mb-4">
          <div class="flex items-center gap-2 px-3 py-2">
            <Clock class="w-4 h-4 text-muted-foreground" />
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {{ t('app.recent') }}
            </span>
          </div>
          <div class="space-y-0.5">
            <button
              v-for="tool in recentTools"
              :key="tool!.id"
              class="w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors"
              :class="[
                isActive(tool!.id)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              ]"
              @click="navigateToTool(tool!.id)"
            >
              <component :is="getIcon(tool!.icon)" class="w-4 h-4 flex-shrink-0" />
              <span class="flex-1 text-left truncate">{{ getToolName(tool!) }}</span>
            </button>
          </div>
        </div>

        <div v-for="category in categories" :key="category" class="mb-2">
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
            @click="toggleCategory(category)"
          >
            <component
              :is="expandedCategories[category] ? ChevronDown : ChevronRight"
              class="w-3 h-3"
            />
            <span>{{ t('app.categories.' + category) }}</span>
            <span class="ml-auto text-xs text-muted-foreground/70">
              {{ toolsByCategory[category]?.length || 0 }}
            </span>
          </button>

          <div v-show="expandedCategories[category]" class="space-y-0.5 ml-2">
            <div
              v-for="tool in toolsByCategory[category]"
              :key="tool.id"
              class="w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors group cursor-pointer"
              :class="[
                isActive(tool.id)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              ]"
              @click="navigateToTool(tool.id)"
            >
              <component :is="getIcon(tool.icon)" class="w-4 h-4 flex-shrink-0" />
              <span class="flex-1 text-left truncate">{{ getToolName(tool) }}</span>
              <div
                role="button"
                tabindex="0"
                class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background/50 transition-opacity"
                @click.stop="handleFavoriteToggle($event, tool.id)"
                @keydown.enter.stop="handleFavoriteToggle($event, tool.id)"
              >
                <Star
                  class="w-3.5 h-3.5"
                  :class="isFavorite(tool.id) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>
