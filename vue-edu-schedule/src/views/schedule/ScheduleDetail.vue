<template>
  <div class="schedule-detail-container">
    <div class="detail-card">
      <h2>课表详情</h2>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ detailData.grade }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ detailData.className }}</el-descriptions-item>
        <el-descriptions-item label="星期">{{ detailData.weekday }}</el-descriptions-item>
        <el-descriptions-item label="节次">{{ detailData.section }}</el-descriptions-item>
        <el-descriptions-item label="周次">{{ detailData.week }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ detailData.course }}</el-descriptions-item>
        <el-descriptions-item label="授课老师">{{ detailData.teacher }}</el-descriptions-item>
        <el-descriptions-item label="上课地点">{{ detailData.place }}</el-descriptions-item>
        <el-descriptions-item label="时间段">{{ detailData.timeRange }}</el-descriptions-item>
      </el-descriptions>
      <el-button type="primary" @click="goBack" style="margin-top: 20px">返回列表</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getScheduleById } from '@/api/schedule'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const detailData = ref({})

// 页面加载时获取详情
onMounted(() => {
  const id = route.params.id
  if (id) {
    getScheduleDetail(id)
  }
})

// 获取课表详情
const getScheduleDetail = async (id) => {
  try {
    const res = await getScheduleById(id)
    if (res.code === 200) {
      detailData.value = res.data
    } else {
      ElMessage.error('获取详情失败')
    }
  } catch (error) {
    ElMessage.error('网络异常')
  }
}

// 返回列表页
const goBack = () => {
  router.push('/layout/schedule/page')
}
</script>

<style scoped>
.schedule-detail-container {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 120px);
}
.detail-card {
  max-width: 800px;
  margin: 0 auto;
}
</style>
