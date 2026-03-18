<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 保留核心路由和用户状态功能（不删除）
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 保留跳课表页的核心方法（业务功能）
const goSchedule = () => {
  router.push('/layout/schedule/page')
}

// 保留跳登录页的核心方法（业务功能）
const goLogin = () => {
  router.push('/login')
}

// 保留无效路由判断逻辑（核心路由守卫辅助）
const isInvalidRoute = () => {
  // 保留你配置的有效路由列表（可根据实际需求补充）
  const validPaths = [
    '/',
    '/login',
    '/layout/schedule/page',
    '/layout/schedule/detail/:id', // 新增：课表详情路由
    '/layout/schedule/teacher', // 新增：老师课表查询路由
    '/layout/user/change-password',
    '/layout/user/course-reminder',
  ]
  // 优化判断逻辑：支持动态路由（如detail/:id）
  return !validPaths.some((path) => {
    if (path.includes(':id')) {
      const basePath = path.split('/:id')[0]
      return route.path.startsWith(basePath)
    }
    return route.path === path
  })
}
</script>

<template>
  <div style="width: 100%; height: 100vh">
    <!-- 核心逻辑保留：无效路由仍显示RouterView（保证404兼容） -->
    <div v-if="isInvalidRoute()">
      <RouterView></RouterView>
    </div>

    <!-- 有效路由：正常显示业务页面（删除所有测试按钮/文字） -->
    <RouterView v-else />
  </div>
</template>

<style>
/* 保留全局基础样式，保证页面布局正常 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  width: 100%;
}
</style>
