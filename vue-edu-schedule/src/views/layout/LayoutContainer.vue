<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <h2>排课系统</h2>
      </div>

      <!-- 完全手动控制，无任何自动展开逻辑 -->
      <el-menu
        v-model:opened="openedMenus"
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <!-- ========== 管理员专属菜单 ========== -->
        <!-- 课表管理（仅管理员可见） -->
        <el-sub-menu index="schedule" v-if="userInfo.role === 1">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>课表管理</span>
          </template>
          <el-menu-item index="/layout/schedule/page">课表列表</el-menu-item>
          <el-menu-item index="/layout/schedule/teacher">课表详情</el-menu-item>
        </el-sub-menu>

        <!-- 用户管理（仅管理员可见） -->
        <el-menu-item index="/layout/admin/user-manage" v-if="userInfo.role === 1">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <!-- 老师与课程管理（仅管理员可见 ✨ 核心修改） -->
        <el-menu-item index="/layout/admin/teacher-course-management" v-if="userInfo.role === 1">
          <el-icon><User /></el-icon>
          <span>老师与课程管理</span>
        </el-menu-item>

        <!-- ========== 老师专属菜单 ========== -->
        <!-- 我的课程（仅老师可见，一级菜单） -->
        <el-menu-item index="/layout/user/my-courses" v-if="userInfo.role === 2">
          <el-icon><Document /></el-icon>
          <span>我的课程</span>
        </el-menu-item>

        <!-- ========== 所有角色通用菜单 ========== -->
        <!-- 个人中心（所有角色可见） -->
        <el-sub-menu index="user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </template>
          <el-menu-item index="/layout/user/change-password">修改密码</el-menu-item>
          <el-menu-item index="/layout/user/course-reminder">课程提醒</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主内容容器 -->
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span>欢迎使用排课系统</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <!-- 渲染用户头像（有则显示，无则显示默认图标） -->
              <el-avatar size="small" :src="userAvatar">
                <UserFilled />
              </el-avatar>
              <!-- 渲染用户名/昵称，根据角色显示默认值 -->
              <span>{{ userName || (userInfo.role === 1 ? '管理员' : '老师') }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
// 导入图标
import { Document, User, UserFilled } from '@element-plus/icons-vue'
// 导入用户Store
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 【核心】默认空数组，页面加载时所有菜单完全收起，不自动展开
const openedMenus = ref([])

// ✨ 修复：用route.path代替fullPath，只匹配路径不包含参数
const activeMenu = computed(() => route.path)

// 获取用户信息（优先从Store取，无则从本地存储取）
const userInfo = computed(() => {
  return userStore.userInfo || JSON.parse(localStorage.getItem('userInfo') || '{}')
})

// 计算属性：用户头像
const userAvatar = computed(() => {
  return userInfo.value.avatar || ''
})

// 计算属性：用户名/昵称
const userName = computed(() => {
  return userInfo.value.nickname || userInfo.value.username || ''
})

// 监听用户信息变化，实时更新页面
watch(
  () => [
    userStore.userInfo?.avatar,
    userStore.userInfo?.nickname,
    userStore.userInfo?.username,
    userStore.userInfo?.role,
  ],
  () => {},
  { deep: true },
)

// 退出登录逻辑
const handleLogout = () => {
  // 清空Store
  userStore.removeToken()
  userStore.setUserInfo(null)
  // 清空本地存储
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('paike-username')

  ElMessage.success('退出登录成功')
  router.push('/login')
}

// ✨ 修复：路由守卫 - 修正路径，只拦截老师访问管理员页面
watch(
  () => route.path, // 改用path，避免参数干扰
  (newPath) => {
    // 如果是老师角色（role=2），且访问管理员专属页面，跳转到我的课程
    if (
      userInfo.value.role === 2 &&
      [
        '/layout/schedule/page',
        '/layout/schedule/teacher',
        '/layout/admin/user-manage',
        '/layout/admin/teacher-course-management', // ✨ 修正：改为新路径
      ].includes(newPath)
    ) {
      ElMessage.warning('您无权限访问该页面，已自动跳转到我的课程')
      router.push('/layout/user/my-courses')
    }
  },
  { immediate: true }, // 页面加载时立即执行
)
</script>

<style scoped>
/* 整体布局：占满全屏，无滚动异常 */
.layout-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #304156;
  overflow-y: auto;
  flex-shrink: 0;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  background-color: #263445;
  border-bottom: 1px solid #263445;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

/* 菜单样式统一 */
:deep(.el-menu) {
  border-right: none;
}

/* 一级菜单项（用户管理/我的课程/老师与课程管理）缩进 */
:deep(.el-menu-item) {
  height: 42px;
  line-height: 42px;
  font-size: 14px;
  padding-left: 20px !important;
}

/* 子菜单标题（课表管理/个人中心）缩进 */
:deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  padding-left: 20px !important;
}

/* 子菜单下的子项（修改密码/课程提醒）缩进 */
:deep(.el-sub-menu .el-menu-item) {
  padding-left: 54px !important;
}

/* 激活菜单项样式 */
:deep(.el-menu-item.is-active) {
  background-color: #1f2d3d !important;
  color: #409eff !important;
  font-weight: 500;
}

/* 展开的子菜单标题样式 */
:deep(.el-sub-menu.is-opened .el-sub-menu__title) {
  background-color: #263445;
}

/* 头部样式 */
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  flex-shrink: 0;
}

.header-left span {
  color: #666;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
}

/* 主内容区 */
.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  margin: 0;
  min-height: calc(100vh - 60px);
}
</style>
