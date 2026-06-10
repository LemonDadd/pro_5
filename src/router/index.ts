import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { toolRegistry } from '@/tools/registry'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const firstTool = toolRegistry.getTools()[0]
      return firstTool ? firstTool.path : '/tool/base64'
    }
  },
  {
    path: '/tool/:toolId',
    name: 'tool',
    component: () => import('@/views/ToolView.vue'),
    props: true
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
