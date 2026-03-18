import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 基础登录守卫：未登录跳登录页
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('token')
  console.log('===== 路由守卫校验 =====')
  console.log('目标路径：', to.path)
  console.log('读取到的token：', token)
  console.log('token是否存在：', !!token)

  if (token) {
    next()
  } else {
    next({ path: '/login', query: { redirect: to.fullPath } })
  }
}

// 管理员权限守卫：仅角色=1的管理员可访问
const checkAdminAuth = (to, from, next) => {
  const userStore = useUserStore()
  const userInfo = userStore.userInfo || JSON.parse(localStorage.getItem('big-user') || '{}')

  if (userInfo.role === 1) {
    next()
  } else {
    ElMessage.error('仅管理员可访问该页面')
    next('/layout/user/my-courses')
  }
}

// 老师权限守卫：仅角色=2的老师可访问
const checkTeacherAuth = (to, from, next) => {
  const userStore = useUserStore()
  const userInfo = userStore.userInfo || JSON.parse(localStorage.getItem('big-user') || '{}')

  if (userInfo.role === 2) {
    next()
  } else {
    ElMessage.error('仅老师可访问该页面')
    next('/layout/schedule/page')
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录页
    {
      path: '/login',
      component: () => import('@/views/login/LoginPage.vue'),
      meta: { title: '登录' },
    },

    // 布局页（需要登录）
    {
      path: '/layout',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      beforeEnter: requireAuth,
      redirect: '/layout/schedule/page',
      meta: { title: '首页' },
      children: [
        // 管理员专属：课表管理模块
        {
          path: 'schedule',
          component: () => import('@/views/schedule/ScheduleContainer.vue'),
          redirect: 'schedule/page',
          beforeEnter: checkAdminAuth,
          children: [
            {
              path: 'page',
              component: () => import('@/views/schedule/SchedulePage.vue'),
              meta: { title: '课表列表' },
            },
            {
              path: 'detail/:id',
              component: () => import('@/views/schedule/ScheduleDetail.vue'),
              meta: { title: '课表详情' },
            },
            {
              path: 'teacher',
              component: () => import('@/views/schedule/TeacherSchedule.vue'),
              meta: { title: '老师课表查询' },
            },
          ],
        },
        // 个人中心模块（所有角色可见）
        {
          path: 'user',
          component: () => import('@/views/user/UserInfrastructure.vue'),
          children: [
            {
              path: 'change-password',
              component: () => import('@/views/user/UserChangePassword.vue'),
              meta: { title: '修改密码' },
            },
            {
              path: 'course-reminder',
              component: () => import('@/views/user/UserCourseReminder.vue'),
              meta: { title: '课程提醒' },
            },
            {
              path: 'my-courses',
              name: 'MyCourses',
              component: () => import('@/views/user/MyCourses.vue'),
              meta: { title: '我的课程' },
              beforeEnter: checkTeacherAuth,
            },
          ],
        },
        // 管理员专属：用户管理模块（优化后）
        {
          path: 'admin',
          // ✅ 父路由用专门的管理员布局组件（仅包含<router-view />）
          component: () => import('@/views/user/AdminHome.vue'),
          redirect: 'admin/user-manage',
          beforeEnter: checkAdminAuth,
          children: [
            {
              path: 'user-manage',
              component: () => import('@/views/user/UserManage.vue'),
              meta: { title: '用户管理' },
            },
            {
              path: 'teacher-course-management',
              component: () => import('@/views/user/CourseManagement.vue'),
              meta: { title: '老师与课程管理' },
            },
            // 可选：如果需要“管理员首页”，单独做一个组件
            {
              path: 'home',
              component: () => import('@/views/user/AdminHome.vue'),
              meta: { title: '管理员首页' },
            },
          ],
        },
      ],
    },

    // 兜底重定向
    { path: '/', redirect: '/login' },
    { path: '/:pathMatch(.*)*', redirect: '/layout/schedule/page' },
  ],
})

// 全局守卫：设置页面标题
router.beforeEach((to, from, next) => {
  document.title = (to.meta.title || '排课系统') + ' - 排课系统'
  next()
})

export default router
