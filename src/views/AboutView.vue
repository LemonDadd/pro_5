<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Shield, Zap, Palette, Keyboard, History, Star, Link2 } from 'lucide-vue-next'

const { t } = useI18n()

function getShortcutKey(key: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const prefix = isMac ? '⌘⇧' : 'Ctrl+Shift+'
  return prefix + key.toUpperCase()
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold mb-2">{{ t('about.title') }}</h1>
      <p class="text-muted-foreground">{{ t('about.privacyContent') }}</p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="p-4 rounded-lg border border-border bg-card">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 rounded-md bg-green-500/10">
            <Shield class="w-5 h-5 text-green-500" />
          </div>
          <h3 class="font-semibold">隐私优先</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          所有计算均在本地浏览器完成，您的数据永远不会上传到服务器。无任何数据采集。
        </p>
      </div>

      <div class="p-4 rounded-lg border border-border bg-card">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 rounded-md bg-blue-500/10">
            <Zap class="w-5 h-5 text-blue-500" />
          </div>
          <h3 class="font-semibold">极速响应</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          纯前端架构，无需等待网络请求，即时获得计算结果。
        </p>
      </div>

      <div class="p-4 rounded-lg border border-border bg-card">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 rounded-md bg-purple-500/10">
            <Palette class="w-5 h-5 text-purple-500" />
          </div>
          <h3 class="font-semibold">深色模式</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          支持明暗主题切换，自动记忆偏好，保护您的眼睛。
        </p>
      </div>

      <div class="p-4 rounded-lg border border-border bg-card">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 rounded-md bg-orange-500/10">
            <Keyboard class="w-5 h-5 text-orange-500" />
          </div>
          <h3 class="font-semibold">快捷键</h3>
        </div>
        <div class="text-sm text-muted-foreground space-y-1">
          <div class="flex justify-between">
            <span>复制输出结果</span>
            <kbd class="px-2 py-0.5 bg-muted rounded text-xs font-mono">{{ getShortcutKey('C') }}</kbd>
          </div>
          <div class="flex justify-between">
            <span>交换输入/输出</span>
            <kbd class="px-2 py-0.5 bg-muted rounded text-xs font-mono">{{ getShortcutKey('X') }}</kbd>
          </div>
          <div class="flex justify-between">
            <span>清空内容</span>
            <kbd class="px-2 py-0.5 bg-muted rounded text-xs font-mono">{{ getShortcutKey('L') }}</kbd>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-lg border border-border bg-card">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 rounded-md bg-pink-500/10">
            <History class="w-5 h-5 text-pink-500" />
          </div>
          <h3 class="font-semibold">历史记录</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          自动保存最近 10 条使用历史，点击任意记录即可快速恢复输入输出。
        </p>
      </div>

      <div class="p-4 rounded-lg border border-border bg-card">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 rounded-md bg-yellow-500/10">
            <Star class="w-5 h-5 text-yellow-500" />
          </div>
          <h3 class="font-semibold">收藏工具</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          收藏常用工具，在侧边栏置顶显示，快速访问。
        </p>
      </div>

      <div class="p-4 rounded-lg border border-border bg-card md:col-span-2">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 rounded-md bg-cyan-500/10">
            <Link2 class="w-5 h-5 text-cyan-500" />
          </div>
          <h3 class="font-semibold">URL 深链</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          支持 URL 深链直达工具和 Tab，如 <code class="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">/#/tool/base64?tab=file</code>，复制分享链接会自动包含当前 Tab 状态。
        </p>
      </div>
    </div>

    <div class="mt-8 text-center text-sm text-muted-foreground">
      <p>版本 1.0.0 | 基于 Vue 3 + TypeScript + Tailwind CSS 构建</p>
    </div>
  </div>
</template>
