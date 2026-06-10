<script setup lang="ts">
import { computed } from 'vue'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/utils/cn'

const appStore = useAppStore()

const mainClasses = computed(() => cn(
  'flex-1 overflow-hidden',
  'transition-all duration-300'
))
</script>

<template>
  <div class="h-full flex flex-col bg-background">
    <div class="flex flex-1 overflow-hidden">
      <Sidebar class="hidden md:block flex-shrink-0" />
      <div :class="mainClasses" class="flex flex-col min-w-0">
        <Topbar />
        <main class="flex-1 overflow-auto p-4 md:p-6">
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </router-view>
        </main>
        <footer class="flex-shrink-0 px-4 py-3 text-xs text-muted-foreground border-t border-border text-center">
          <span>所有计算均在本地完成，数据不会离开您的浏览器</span>
        </footer>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="drawer">
        <div
          v-if="appStore.mobileSidebarOpen"
          class="fixed inset-0 z-40 md:hidden"
        >
          <div
            class="absolute inset-0 bg-black/50"
            @click="appStore.closeMobileSidebar()"
          />
          <Sidebar class="absolute left-0 top-0 h-full w-72 z-50 animate-slide-in" />
        </div>
      </Transition>
    </Teleport>

    <ToastContainer />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
