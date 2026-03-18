<template>
  <div class="admin-home">
    <el-card>
      <h2>欢迎进入管理员后台</h2>
      <router-view />
      <div class="admin-menu">
        <el-button type="primary" @click="goToUserManage">用户管理（重置密码）</el-button>
        <el-button type="success" @click="goToSystemSetting">系统设置（待扩展）</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 跳转到用户管理页面（重置密码核心页面）
const goToUserManage = () => {
  router.push('/layout/admin/user-manage')
}
</script>

<style scoped>
.admin-home {
  padding: 20px;
}
.admin-menu {
  margin-top: 20px;
  display: flex;
  gap: 20px;
}
</style>
