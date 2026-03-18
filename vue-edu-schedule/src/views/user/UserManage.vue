<template>
  <div class="user-manage">
    <el-card>
      <div class="search-bar">
        <el-input
          v-model="searchUsername"
          placeholder="请输入用户名搜索"
          style="width: 300px"
          @keyup.enter="fetchUserList"
        ></el-input>
        <el-button type="primary" @click="fetchUserList">搜索</el-button>
      </div>

      <el-table :data="userList" border stripe style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="用户ID" width="80"></el-table-column>
        <el-table-column prop="username" label="账号" width="150"></el-table-column>
        <el-table-column prop="nickname" label="昵称" width="150"></el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.role === 1">管理员</el-tag>
            <el-tag v-else type="success">老师</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              v-if="scope.row.role === 2"
              type="warning"
              size="small"
              @click="handleResetPassword(scope.row)"
            >
              重置密码
            </el-button>
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 20px; text-align: right"
      >
      </el-pagination>
    </el-card>

    <!-- 重置密码弹窗 -->
    <el-dialog title="重置老师密码" v-model="resetDialogVisible" width="300px">
      <el-form :model="resetForm" label-width="80px">
        <el-form-item label="新密码">
          <el-input v-model="resetForm.newPassword" placeholder="默认123456"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPassword">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
// 导入的接口名保持不变
import { getUserList, adminResetPassword, deleteUser } from '@/api/user'

const router = useRouter()

// 查询参数
const searchUsername = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const userList = ref([])

// 重置密码弹窗
const resetDialogVisible = ref(false)
const resetForm = reactive({
  userId: '',
  newPassword: '123456',
})

// 核心修改：把函数名改成 fetchUserList，避免和导入的接口名冲突
const fetchUserList = async () => {
  try {
    // 调用导入的 getUserList 接口，逻辑不变
    const res = await getUserList({
      username: searchUsername.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    userList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取用户列表失败：' + error.message)
  }
}

// 打开重置密码弹窗
const handleResetPassword = (row) => {
  resetForm.userId = row.id
  resetForm.newPassword = '123456'
  resetDialogVisible.value = true
}

// 确认重置密码
const confirmResetPassword = async () => {
  try {
    const res = await adminResetPassword({
      userId: resetForm.userId,
      newPassword: resetForm.newPassword,
    })
    ElMessage.success('重置成功，新密码为：' + resetForm.newPassword)
    resetDialogVisible.value = false
    // 调用改名后的函数
    fetchUserList()
  } catch (error) {
    ElMessage.error('重置失败：' + error.message)
  }
}

// 删除用户
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning',
    })
    await deleteUser(id)
    ElMessage.success('删除成功')
    // 调用改名后的函数
    fetchUserList()
  } catch (error) {
    ElMessage.info('已取消删除')
  }
}

// 编辑用户
const handleEdit = (row) => {
  ElMessage.info('编辑功能可后续扩展')
}

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val
  // 调用改名后的函数
  fetchUserList()
}
const handleCurrentChange = (val) => {
  pageNum.value = val
  // 调用改名后的函数
  fetchUserList()
}

// 页面初始化调用改名后的函数
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-manage {
  padding: 20px;
}
.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}
:deep(.el-card) {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 新增：让操作列的按钮在同一行紧凑排列 */
:deep(.el-table .cell) {
  display: flex;
  gap: 5px; /* 减小按钮之间的间距 */
  flex-wrap: nowrap; /* 禁止换行 */
}

:deep(.el-table .cell .el-button) {
  margin: 0 !important; /* 清除按钮默认的 margin */
  padding: 7px 10px !important; /* 减小按钮内边距，让它更紧凑 */
}
</style>
