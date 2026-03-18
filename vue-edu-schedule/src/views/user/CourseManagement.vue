<template>
  <div class="course-management-container">
    <!-- 筛选栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="老师姓名">
          <el-input v-model="searchForm.teacherName" placeholder="请输入老师姓名" clearable />
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="searchForm.courseName" placeholder="请输入课程名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getTeacherCourseList()">查询</el-button>
          <el-button @click="resetSearchForm()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="success" icon="el-icon-plus" @click="handleAdd()">新增绑定</el-button>
    </div>

    <!-- 老师-课程绑定列表 -->
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
        <el-table-column prop="teacherName" label="老师姓名" width="120" align="center" />
        <el-table-column prop="teacherId" label="老师ID" width="80" align="center" />
        <el-table-column prop="courseName" label="课程名称" width="150" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button size="small" type="warning" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
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
      :title="dialogType === 'add' ? '新增老师-课程绑定' : '编辑老师-课程绑定'"
      width="500px"
      @close="resetDialogForm()"
    >
      <el-form :model="dialogForm" label-width="100px" ref="formRef">
        <!-- 老师下拉选择框，自动获取teacherId，无需手动输入 -->
        <el-form-item
          label="选择老师"
          prop="teacherId"
          :rules="[{ required: true, message: '请选择老师' }]"
        >
          <el-select
            v-model="dialogForm.teacherId"
            placeholder="请选择老师"
            @change="handleTeacherChange"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="teacher in teacherOptions"
              :key="teacher.value"
              :label="teacher.label"
              :value="teacher.value"
            />
          </el-select>
        </el-form-item>
        <!-- 老师姓名自动填充，禁止手动修改 -->
        <el-form-item
          label="老师姓名"
          prop="teacherName"
          :rules="[{ required: true, message: '请选择老师自动填充' }]"
        >
          <el-input v-model="dialogForm.teacherName" placeholder="选择老师后自动填充" disabled />
        </el-form-item>
        <el-form-item
          label="课程名称"
          prop="courseName"
          :rules="[{ required: true, message: '请选择课程名称' }]"
        >
          <el-select
            v-model="dialogForm.courseName"
            placeholder="请选择课程名称"
            style="width: 100%"
          >
            <el-option label="语文" value="语文" />
            <el-option label="数学" value="数学" />
            <el-option label="英语" value="英语" />
            <el-option label="物理" value="物理" />
            <el-option label="化学" value="化学" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit()">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const teacherOptions = ref([]) // 老师下拉选项列表（新增）
const searchForm = reactive({
  teacherName: '',
  courseName: '',
})
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})
const dialogVisible = ref(false)
const dialogType = ref('add')
const dialogForm = reactive({
  id: '',
  teacherId: '',
  teacherName: '',
  courseName: '',
})
const formRef = ref(null)
const selectedRows = ref([])

// 页面挂载时加载数据
onMounted(() => {
  getTeacherList() // 加载所有老师列表，用于下拉选择
  getTeacherCourseList()
})

// 新增：获取所有老师列表（自动获取teacherId，无需手动查询）
const getTeacherList = async () => {
  try {
    // 调用后端已有的用户列表接口，获取所有老师
    const res = await request.get('/api/sysusers', {
      params: {
        pageNum: 1,
        pageSize: 1000, // 一次性获取所有老师，无需分页
      },
    })

    if (res.code === 200) {
      const allUsers = res.data.list || []
      // 过滤出老师角色（role=2），组装成下拉框选项
      teacherOptions.value = allUsers
        .filter((user) => user.role === 2)
        .map((user) => ({
          label: user.nickname || user.username, // 下拉框显示老师姓名
          value: user.id, // 下拉框实际值为老师ID
          teacherName: user.nickname || user.username, // 额外存储老师姓名，用于自动填充
        }))
    }
  } catch (error) {
    console.error('获取老师列表失败：', error)
    ElMessage.error('获取老师列表失败，请刷新页面重试')
  }
}

// 新增：选中老师后，自动填充老师姓名和ID
const handleTeacherChange = (teacherId) => {
  const selectedTeacher = teacherOptions.value.find((item) => item.value === teacherId)
  if (selectedTeacher) {
    dialogForm.teacherName = selectedTeacher.teacherName
  } else {
    dialogForm.teacherName = ''
  }
}

// 核心：查询绑定列表（路径严格匹配后端控制器前缀）
const getTeacherCourseList = async () => {
  loading.value = true
  try {
    // 完整请求路径：baseURL + /api/teacher/admin/schedule/teacher-course-bind-list
    const res = await request.get('/api/teacher/admin/schedule/teacher-course-bind-list', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      },
    })

    if (res.code === 200) {
      const bindList = res.data.list || []
      tableData.value = bindList
      pagination.total = res.data.total || 0
    } else {
      throw new Error(res.message || '获取绑定列表失败')
    }
  } catch (error) {
    console.error('查询失败：', error)
    ElMessage.error(`获取绑定列表失败：${error.message || '网络异常'}`)
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetSearchForm = () => {
  searchForm.teacherName = ''
  searchForm.courseName = ''
  pagination.pageNum = 1
  getTeacherCourseList()
}

// 分页事件
const handleSizeChange = (val) => {
  pagination.pageSize = val
  getTeacherCourseList()
}
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  getTeacherCourseList()
}

// 新增弹窗
const handleAdd = () => {
  dialogType.value = 'add'
  resetDialogForm()
  dialogVisible.value = true
}

// 编辑弹窗
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(dialogForm, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

// 删除绑定
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该绑定关系？', '提示', { type: 'warning' })
    const res = await request.delete(`/api/teacher/admin/schedule/unbind-course-from-teacher/${id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getTeacherCourseList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败：', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交新增/编辑
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch (error) {
    ElMessage.error('请完善必填项')
    return
  }

  try {
    if (dialogType.value === 'add') {
      // 新增路径严格匹配后端接口
      const res = await request.post('/api/teacher/admin/schedule/bind-course-to-teacher', {
        teacherId: dialogForm.teacherId,
        courseName: dialogForm.courseName,
      })
      if (res.code === 200) {
        ElMessage.success('新增绑定成功')
        dialogVisible.value = false
        getTeacherCourseList()
      } else {
        ElMessage.error(res.message || '新增失败')
      }
    } else {
      ElMessage.info('编辑功能暂未开放，建议删除后重新新增')
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('提交失败：', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 重置弹窗表单
const resetDialogForm = () => {
  dialogForm.id = ''
  dialogForm.teacherId = ''
  dialogForm.teacherName = ''
  dialogForm.courseName = ''
  if (formRef.value) formRef.value.clearValidate()
}

// 表格批量选择
const handleSelectionChange = (val) => {
  selectedRows.value = val
}
</script>

<style scoped>
.course-management-container {
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

.table-container {
  width: 100%;
}
</style>
