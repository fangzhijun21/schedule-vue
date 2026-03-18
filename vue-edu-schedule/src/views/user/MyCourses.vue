<template>
  <div class="my-courses-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>我的课程表</h2>
      <el-button type="primary" @click="fetchMyCourses" icon="el-icon-refresh">
        刷新课表
      </el-button>
    </div>

    <!-- 课表表格 -->
    <el-table
      :data="courseList"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
    >
      <el-table-column prop="course" label="课程名称" width="120" align="center" />
      <el-table-column prop="grade" label="年级" width="80" align="center" />
      <el-table-column prop="className" label="班级" width="80" align="center" />
      <el-table-column prop="weekday" label="星期" width="80" align="center" />
      <el-table-column prop="place" label="上课地点" width="150" align="center" />
      <el-table-column prop="timeRange" label="上课时间" width="180" align="center" />
      <el-table-column prop="section" label="节次" width="80" align="center" />
    </el-table>

    <!-- 空数据提示 -->
    <div v-if="!loading && courseList.length === 0" class="empty-tip">
      <el-empty description="暂无已分配的课程" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

// 响应式数据
const loading = ref(false) // 加载状态
const courseList = ref([]) // 课表列表

// 获取当前登录老师的昵称（从本地存储解析）
const getTeacherName = () => {
  // 兼容不同的本地存储键名
  const userInfoStr = localStorage.getItem('big-user') || localStorage.getItem('paike-username')
  if (!userInfoStr) return ''

  try {
    const userInfo = JSON.parse(userInfoStr)
    // 优先取昵称，没有则取用户名
    return userInfo.nickname || userInfo.username || ''
  } catch (e) {
    console.error('解析用户信息失败：', e)
    return ''
  }
}

// 核心方法：获取我的课表
const fetchMyCourses = async () => {
  // 1. 基础校验：获取老师昵称
  const teacherName = getTeacherName()
  if (!teacherName) {
    ElMessage.error('未获取到用户信息，请重新登录')
    return
  }

  // 2. 发起请求
  loading.value = true
  try {
    // 调用后端接口（相对路径，自动拼接 baseURL）
    const res = await request.get('/api/teacher/my-schedules', {
      params: { teacherName }, // 传参：老师昵称
    })

    // 3. 处理响应数据
    if (res && res.data) {
      courseList.value = Array.isArray(res.data) ? res.data : []
      if (courseList.value.length > 0) {
        ElMessage.success(`成功加载 ${courseList.value.length} 条课表数据`)
      } else {
        ElMessage.info('暂无课表数据')
      }
    }
  } catch (error) {
    console.error('获取课表失败：', error)
    courseList.value = [] // 失败时清空列表
  } finally {
    loading.value = false // 无论成功失败，关闭加载状态
  }
}

// 页面挂载时自动加载课表
onMounted(() => {
  fetchMyCourses()
})
</script>

<style scoped>
.my-courses-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-tip {
  margin-top: 50px;
  text-align: center;
}

/* 表格样式优化 */
.el-table {
  --el-table-header-text-color: #333;
  --el-table-row-hover-bg-color: #f8f9fa;
}
</style>
