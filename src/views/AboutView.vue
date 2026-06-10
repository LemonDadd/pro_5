<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Shield, Zap, Palette, Keyboard, History, Star } from 'lucide-vue-next'

const { t } = useI18n()
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
          所有计算均在本地浏览器完成，您的数据永远不会上传到服务器。
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
          支持明暗主题切换，保护您的眼睛，适应不同使用环境。
        </p>
      </div>

      <div class="p-4 rounded-lg border border-border bg-card">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 rounded-md bg-orange-500/10">
            <Keyboard class="w-5 h-5 text-orange-500" />
          </div>
          <h3 class="font-semibold">快捷键</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          支持键盘快捷键操作，提升您的工作效率。
        </p>
      </div>

      <div class="p-4 rounded-lg border border-border bg-card">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 rounded-md bg-pink-500/10">
            <History class="w-5 h-5 text-pink-500" />
          </div>
          <h3 class="font-semibold">历史记录</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          自动保存使用历史，方便快速回顾和复用。
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
          收藏常用工具，置顶显示，快速访问。
        </p>
      </div>
    </div>

    <div class="mt-8 text-center text-sm text-muted-foreground">
      <p>版本 1.0.0 | 基于 Vue 3 + TypeScript 构建</p>
    </div>
  </div>
</template>
