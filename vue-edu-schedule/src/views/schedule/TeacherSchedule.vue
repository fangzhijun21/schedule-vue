<template>
  <div class="teacher-schedule-container">
    <!-- 搜索区域：增大标题字号 + 加宽边距 -->
    <div class="search-section">
      <h2 class="search-title">老师课表查询</h2>
      <el-input
        v-model="teacherName"
        placeholder="请输入老师姓名"
        clearable
        @keyup.enter="handleSearch"
        class="search-input"
      >
        <template #append>
          <el-button @click="handleSearch">查询</el-button>
        </template>
      </el-input>
    </div>

    <!-- 结果区域：加宽表格边距 + 增大标题字号 -->
    <div class="result-section" v-if="scheduleList.length > 0">
      <h3 class="result-title">{{ teacherName }} 老师的课表</h3>
      <el-table :data="scheduleList" border stripe style="width: 100%" class="schedule-table">
        <el-table-column prop="grade" label="年级" width="100" align="center" />
        <el-table-column prop="className" label="班级" width="100" align="center" />
        <el-table-column prop="weekday" label="星期" width="100" align="center" />
        <el-table-column prop="section" label="节次" width="80" align="center" />
        <el-table-column prop="week" label="周次" width="120" align="center" />
        <el-table-column prop="course" label="课程名称" width="150" align="center" />
        <el-table-column prop="teacher" label="授课老师" width="120" align="center" />
        <el-table-column prop="place" label="上课地点" width="150" align="center" />
        <el-table-column prop="timeRange" label="时间段" width="120" align="center" />
      </el-table>
    </div>

    <el-empty v-else-if="searched" description="暂无该老师的课表" class="empty-tip" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getScheduleList } from '@/api/schedule'
import { ElMessage } from 'element-plus'

const teacherName = ref('')
const scheduleList = ref([])
const searched = ref(false)

// 搜索老师课表（精确匹配老师姓名）
const handleSearch = async () => {
  if (!teacherName.value.trim()) {
    ElMessage.warning('请输入老师姓名')
    return
  }

  try {
    const params = {
      teacher: teacherName.value,
      pageNum: 1,
      pageSize: 100,
    }
    const res = await getScheduleList(params)
    // 精确过滤：只保留和输入姓名完全一致的课表
    scheduleList.value = (res.data.records || []).filter(
      (item) => item.teacher === teacherName.value,
    )
    searched.value = true
  } catch (error) {
    ElMessage.error('查询失败')
  }
}
</script>

<style scoped>
/* 整体容器：加宽内边距 */
.teacher-schedule-container {
  padding: 40px;
  background: #fff;
  min-height: calc(100vh - 60px);
}

/* 搜索区域：加宽底部间距 */
.search-section {
  max-width: 700px;
  margin-bottom: 40px;
}

/* 统一两个标题的大小和粗细 */
.search-title,
.result-title {
  font-size: 22px;
  font-weight: 600;
  color: #304156;
}

/* 搜索标题底部间距 */
.search-title {
  margin-bottom: 20px;
}

/* 输入框：增大高度 + 加宽内边距 */
.search-input {
  height: 50px;
  font-size: 16px;
}

/* 结果区域：加宽顶部间距 */
.result-section {
  margin-top: 30px;
}

/* 结果标题底部间距 */
.result-title {
  margin-bottom: 20px;
}

/* 表格：加宽内边距 + 增大文字 */
.schedule-table {
  font-size: 15px;
}
:deep(.schedule-table .el-table__cell) {
  padding: 15px 0;
}

/* 空提示：加宽顶部间距 */
.empty-tip {
  margin-top: 50px;
}
</style>
