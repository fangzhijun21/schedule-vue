<template>
  <div class="schedule-page-container">
    <!-- 筛选和操作栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="年级">
          <el-input v-model="searchForm.grade" placeholder="请输入年级" clearable />
        </el-form-item>
        <el-form-item label="班级">
          <el-input v-model="searchForm.className" placeholder="请输入班级" clearable />
        </el-form-item>
        <el-form-item label="星期">
          <el-select v-model="searchForm.weekday" placeholder="请选择星期" clearable>
            <el-option label="周一" value="周一" />
            <el-option label="周二" value="周二" />
            <el-option label="周三" value="周三" />
            <el-option label="周四" value="周四" />
            <el-option label="周五" value="周五" />
            <el-option label="周六" value="周六" />
            <el-option label="周日" value="周日" />
          </el-select>
        </el-form-item>
        <el-form-item label="授课老师">
          <el-input v-model="searchForm.teacher" placeholder="请输入老师姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getScheduleListData()">查询</el-button>
          <el-button @click="resetSearchForm()">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button type="success" icon="Plus" @click="handleAdd()">新增课表</el-button>
        <el-button
          type="warning"
          icon="User"
          @click="handleAssignCourse()"
          v-if="selectedRows.length > 0"
        >
          分配给老师
        </el-button>
        <el-button
          type="danger"
          icon="Delete"
          @click="handleBatchDelete()"
          v-if="selectedRows.length > 0"
        >
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 课表列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="grade" label="年级" width="100" align="center" />
        <el-table-column prop="className" label="班级" width="100" align="center" />
        <el-table-column prop="weekday" label="星期" width="100" align="center" />
        <el-table-column prop="section" label="节次" width="80" align="center" />
        <el-table-column prop="week" label="周次" width="120" align="center" />
        <el-table-column prop="course" label="课程名称" width="150" align="center" />
        <el-table-column
          prop="teacher"
          label="授课老师"
          width="120"
          align="center"
          :formatter="formatTeacherName"
        />
        <el-table-column prop="place" label="上课地点" width="150" align="center" />
        <el-table-column prop="timeRange" label="时间段" width="120" align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button size="small" type="info" @click="handleDetail(scope.row)">详情</el-button>
            <el-button size="small" type="warning" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; text-align: right"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增课表' : '编辑课表'"
      width="600px"
      @close="resetDialogForm()"
    >
      <el-form :model="dialogForm" label-width="100px" ref="formRef">
        <el-form-item
          label="年级"
          prop="grade"
          :rules="[{ required: true, message: '请输入年级' }]"
        >
          <el-input v-model="dialogForm.grade" placeholder="请输入年级" />
        </el-form-item>
        <el-form-item
          label="班级"
          prop="className"
          :rules="[{ required: true, message: '请输入班级' }]"
        >
          <el-input v-model="dialogForm.className" placeholder="请输入班级" />
        </el-form-item>
        <el-form-item
          label="星期"
          prop="weekday"
          :rules="[{ required: true, message: '请选择星期' }]"
        >
          <el-select v-model="dialogForm.weekday" placeholder="请选择星期">
            <el-option label="周一" value="周一" />
            <el-option label="周二" value="周二" />
            <el-option label="周三" value="周三" />
            <el-option label="周四" value="周四" />
            <el-option label="周五" value="周五" />
            <el-option label="周六" value="周六" />
            <el-option label="周日" value="周日" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="节次"
          prop="section"
          :rules="[{ required: true, message: '请输入节次' }]"
        >
          <el-input v-model.number="dialogForm.section" placeholder="请输入节次（数字）" />
        </el-form-item>
        <el-form-item label="周次" prop="week" :rules="[{ required: true, message: '请输入周次' }]">
          <el-input v-model="dialogForm.week" placeholder="如：1-18周" />
        </el-form-item>
        <!-- 新增：老师ID输入项 -->
        <el-form-item
          label="老师ID"
          prop="teacherId"
          :rules="[{ required: true, message: '请输入老师ID' }]"
        >
          <el-input v-model.number="dialogForm.teacherId" placeholder="请输入老师ID（数字）" />
        </el-form-item>
        <!-- 改造：课程下拉框改为动态加载 -->
        <el-form-item
          label="课程名称"
          prop="course"
          :rules="[{ required: true, message: '请选择课程名称' }]"
        >
          <el-select
            v-model="dialogForm.course"
            placeholder="请先输入老师ID获取可教课程"
            :disabled="teacherCourses.length === 0"
          >
            <el-option
              v-for="course in teacherCourses"
              :key="course"
              :label="course"
              :value="course"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="授课老师"
          prop="teacher"
          :rules="[{ required: true, message: '请输入授课老师' }]"
        >
          <el-input v-model="dialogForm.teacher" placeholder="请输入授课老师姓名" />
        </el-form-item>
        <el-form-item
          label="上课地点"
          prop="place"
          :rules="[{ required: true, message: '请输入上课地点' }]"
        >
          <el-input v-model="dialogForm.place" placeholder="请输入上课地点" />
        </el-form-item>
        <el-form-item
          label="时间段"
          prop="timeRange"
          :rules="[{ required: true, message: '请输入时间段' }]"
        >
          <el-input v-model="dialogForm.timeRange" placeholder="如：08:00-08:45" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit()">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配课程给老师弹窗 -->
    <el-dialog v-model="assignDialogVisible" title="批量分配课程给老师" width="400px">
      <el-form :model="assignForm" label-width="100px" ref="assignFormRef">
        <el-form-item
          label="老师姓名"
          prop="teacherName"
          :rules="[{ required: true, message: '请输入老师姓名' }]"
        >
          <el-input v-model="assignForm.teacherName" placeholder="请输入老师姓名" />
        </el-form-item>
        <el-form-item
          label="老师ID"
          prop="teacherId"
          :rules="[{ required: true, message: '请输入老师ID' }]"
        >
          <el-input v-model.number="assignForm.teacherId" placeholder="请输入老师ID（数字）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignSubmit()">确定分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// 关键修改：导入封装好的 request 实例（自动带 Bearer token）
import request from '@/utils/request'

// 初始化路由
const router = useRouter()

// 加载状态
const loading = ref(false)
// 表格数据
const tableData = ref([])
// 筛选表单
const searchForm = reactive({
  grade: '',
  className: '',
  weekday: '',
  teacher: '',
})
// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})
// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const dialogForm = reactive({
  id: '',
  grade: '',
  className: '',
  weekday: '',
  section: '',
  week: '',
  course: '',
  teacher: '',
  place: '',
  timeRange: '',
  teacherId: '', // 新增：老师ID字段
})
// 新增：存储老师可教课程列表
const teacherCourses = ref([])
// 分配课程弹窗
const assignDialogVisible = ref(false)
const assignForm = reactive({
  teacherName: '',
  teacherId: '',
})
// 表单校验ref
const formRef = ref(null)
const assignFormRef = ref(null)
// 批量选择的行
const selectedRows = ref([])

// 页面加载时获取课表列表
onMounted(() => {
  getScheduleListData()
})

// 格式化老师姓名（处理空值）
const formatTeacherName = (row) => {
  return row.teacher || '未分配'
}

// 关键修改：修复监听逻辑，改用封装的 request 实例，去掉 immediate
watch(
  () => dialogForm.teacherId,
  async (newVal) => {
    if (!newVal || newVal <= 0) {
      teacherCourses.value = []
      dialogForm.course = '' // 清空已选课程
      return
    }
    try {
      // 关键修改：用封装的 request 实例，自动带 Bearer token
      const res = await request.get(`/api/teacher/admin/schedule/get-teacher-courses/${newVal}`)
      if (res.code === 200) {
        teacherCourses.value = res.data || []
        if (teacherCourses.value.length === 0) {
          ElMessage.warning('该老师未绑定任何课程，请先在【老师与课程管理】中绑定')
        } else {
          ElMessage.success(`获取到该老师可教课程：${teacherCourses.value.join('、')}`)
        }
      } else {
        ElMessage.error(res.message || '获取老师可教课程失败')
        teacherCourses.value = []
      }
    } catch (error) {
      console.error('获取老师可教课程失败：', error)
      ElMessage.error('获取老师可教课程失败，请检查后端服务')
      teacherCourses.value = []
    }
  },
  // 关键修改：去掉 immediate: true，避免初始化时执行
)

// 关键修改：获取课表列表改用 request 实例
const getScheduleListData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      role: localStorage.getItem('role') || 1,
    }

    // 改用封装的 request 实例
    const res = await request.get('/api/teacher/admin/schedule/course-management', {
      params,
    })

    if (res.code === 200) {
      tableData.value = res.data?.list || []
      pagination.total = res.data?.total || 0
      ElMessage.success('获取课表数据成功')
    } else {
      ElMessage.error(res.message || '获取课表列表失败')
    }
  } catch (error) {
    console.error('获取课表失败：', error)
    if (error.msg?.includes('无权限')) {
      ElMessage.error('您无权限访问管理员页面，请以管理员身份登录')
      router.push('/login')
    } else if (error.response) {
      ElMessage.error(`获取课表失败：${error.response.status} - ${error.response.statusText}`)
    } else {
      ElMessage.error('获取课表失败：网络异常或后端服务未启动')
    }
  } finally {
    loading.value = false
  }
}

// 重置筛选表单
const resetSearchForm = () => {
  searchForm.grade = ''
  searchForm.className = ''
  searchForm.weekday = ''
  searchForm.teacher = ''
  getScheduleListData()
}

// 分页-每页条数改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  getScheduleListData()
}

// 分页-当前页改变
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  getScheduleListData()
}

// 详情按钮
const handleDetail = (row) => {
  console.log('查看课表详情：', row)
  router.push(`/layout/schedule/detail/${row.id}`)
}

// 新增按钮
const handleAdd = () => {
  dialogType.value = 'add'
  resetDialogForm()
  dialogVisible.value = true
}

// 编辑按钮
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(dialogForm, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

// 关键修改：删除改用 request 实例
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该课表吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const res = await request.delete(`/api/teacher/admin/schedule/delete-course/${id}`)

    if (res.code === 200) {
      ElMessage.success('删除成功')
      getScheduleListData()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`删除失败：${error.message || '操作取消'}`)
    }
  }
}

// 关键修改：批量删除改用 request 实例
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的课表')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}条课表吗？`, '提示', {
      type: 'warning',
    })

    const ids = selectedRows.value.map((item) => item.id)
    const res = await request.post('/api/teacher/admin/schedule/batch-delete', { ids })

    if (res.code === 200) {
      ElMessage.success('批量删除成功')
      getScheduleListData()
    } else {
      ElMessage.error(res.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`批量删除失败：${error.message || '操作取消'}`)
    }
  }
}

// 分配课程给老师
const handleAssignCourse = () => {
  assignDialogVisible.value = true
  assignForm.teacherName = ''
  assignForm.teacherId = ''
}

// 关键修改：提交分配改用 request 实例
const handleAssignSubmit = async () => {
  if (!assignFormRef.value) return
  try {
    await assignFormRef.value.validate()
  } catch (error) {
    ElMessage.error('请完善表单必填项')
    return
  }

  try {
    const res = await request.post('/api/teacher/admin/schedule/assign-courses', {
      teacherId: assignForm.teacherId,
      courseIds: selectedRows.value.map((item) => item.id),
    })

    if (res.code === 200) {
      ElMessage.success('课程分配成功')
      assignDialogVisible.value = false
      getScheduleListData()
    } else {
      ElMessage.error(res.message || '课程分配失败')
    }
  } catch (error) {
    ElMessage.error(`分配失败：${error.message || '网络异常'}`)
  }
}

// 关键修改：提交新增/编辑改用 request 实例
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch (error) {
    ElMessage.error('请完善表单必填项')
    return
  }

  // 新增：校验课程是否在老师可教列表中
  if (teacherCourses.value.length > 0 && !teacherCourses.value.includes(dialogForm.course)) {
    ElMessage.error(
      `该老师仅能教授【${teacherCourses.value.join('、')}】，无法选择【${dialogForm.course}】`,
    )
    return
  }

  try {
    let res

    if (dialogType.value === 'add') {
      res = await request.post('/api/teacher/admin/schedule/add-course', dialogForm)
    } else {
      res = await request.put(
        `/api/teacher/admin/schedule/update-course/${dialogForm.id}`,
        dialogForm,
      )
    }

    if (res.code === 200) {
      ElMessage.success(dialogType.value === 'add' ? '新增课表成功' : '编辑课表成功')
      dialogVisible.value = false
      getScheduleListData()
    } else {
      ElMessage.error(res.message || (dialogType.value === 'add' ? '新增失败' : '编辑失败'))
    }
  } catch (error) {
    ElMessage.error(`提交失败：${error.message || '网络异常'}`)
    console.error('提交失败详情：', error)
  }
}

// 重置弹窗表单 - 新增清空老师ID和课程列表
const resetDialogForm = () => {
  dialogForm.id = ''
  dialogForm.grade = ''
  dialogForm.className = ''
  dialogForm.weekday = ''
  dialogForm.section = ''
  dialogForm.week = ''
  dialogForm.course = ''
  dialogForm.teacher = ''
  dialogForm.place = ''
  dialogForm.timeRange = ''
  dialogForm.teacherId = '' // 清空老师ID
  teacherCourses.value = [] // 清空课程列表

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 批量选择行
const handleSelectionChange = (val) => {
  selectedRows.value = val
}
</script>

<style scoped>
.schedule-page-container {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 120px);
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-form {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.table-container {
  width: 100%;
}

@media (max-width: 1200px) {
  .search-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    margin-top: 10px;
  }
}
</style>
