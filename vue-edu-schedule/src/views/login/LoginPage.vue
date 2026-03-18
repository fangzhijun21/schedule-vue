<template>
  <div class="login-container">
    <el-card class="login-card" :body-style="{ padding: '40px' }">
      <div class="header">
        <h1 class="title">排课系统</h1>
        <h2 class="subtitle">CourseSchedulingSystem</h2>
      </div>

      <el-tabs v-model="activeTab" class="tabs" stretch @tab-change="handleTabChange">
        <!-- 登录标签页 -->
        <el-tab-pane label="登录" name="login">
          <el-form
            :model="loginForm"
            :rules="loginRules"
            ref="loginFormRef"
            label-position="top"
            class="form"
            @submit.prevent
            autocomplete="off"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
                size="large"
                autocomplete="new-password"
                :key="inputKey"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                size="large"
                show-password
                autocomplete="new-password"
              />
            </el-form-item>
            <!-- 新增：角色选择（管理员/老师） -->
            <el-form-item prop="role">
              <el-radio-group v-model="loginForm.role" size="large">
                <el-radio label="1">管理员</el-radio>
                <el-radio label="2">老师</el-radio>
              </el-radio-group>
            </el-form-item>
            <div class="options">
              <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
              <el-button link type="primary" @click="forgotPassword"> 忘记密码？ </el-button>
            </div>
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                class="submit-btn"
                size="large"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 注册标签页 -->
        <el-tab-pane label="注册" name="register">
          <el-form
            :model="registerForm"
            :rules="registerRules"
            ref="registerFormRef"
            label-position="top"
            class="form"
            @submit.prevent
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号"
                :prefix-icon="Iphone"
                size="large"
              />
            </el-form-item>
            <!-- 新增：注册时选择角色 -->
            <el-form-item prop="role">
              <el-radio-group v-model="registerForm.role" size="large">
                <el-radio label="1">管理员</el-radio>
                <el-radio label="2">老师</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                class="submit-btn"
                size="large"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Iphone } from '@element-plus/icons-vue'
import { userLogin, userRegister } from '@/api/user'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)
const inputKey = ref(0)

const loginFormRef = ref()
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false,
  role: '2', // 默认选择老师角色
})

// 新增：登录表单添加role校验
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择登录角色', trigger: 'change' }],
}

const registerFormRef = ref()
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role: '2', // 默认注册为老师
})

// 新增：注册表单添加role校验
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择注册角色', trigger: 'change' }],
}

// 优化登录逻辑：适配角色区分 + 动态跳转
// 优化登录逻辑：适配角色区分 + 动态跳转 + 正确保存avatar
const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    await loginFormRef.value.validate()
    loading.value = true

    // 1. 发送真实登录请求（携带角色参数）
    const res = await userLogin({
      username: loginForm.username,
      password: loginForm.password,
      role: loginForm.role, // 新增：传递角色参数
    })

    // 2. 解析后端响应（重点：正确读取avatar字段）
    // 后端返回的是 {code:200, data: {id, username, avatar, token, role...}}
    const realData = res.data || {} // 后端返回的用户信息本体
    const realToken = realData.token

    // 3. 校验Token有效性
    if (!realToken) {
      ElMessage.error('登录失败：后端未返回有效Token')
      loading.value = false
      return
    }

    // 4. 存储用户信息（包含avatar，关键修复！）
    localStorage.setItem('token', realToken)
    userStore.setToken(realToken)

    // 核心：完整读取后端返回的avatar，并存入localStorage
    const userInfo = {
      id: realData.id || '',
      username: realData.username || loginForm.username,
      nickname: realData.nickname || realData.username || loginForm.username,
      avatar: realData.avatar || '', // 正确读取后端返回的头像地址
      role: realData.role || loginForm.role,
      roleName: loginForm.role === '1' ? '管理员' : '老师',
    }
    // 同时存两个键（兼容你现有代码）：big-user 和 userInfo
    localStorage.setItem('big-user', JSON.stringify(userInfo))
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    userStore.setUserInfo(userInfo) // 同步到Pinia

    // 5. 记住用户名逻辑
    if (loginForm.rememberMe) {
      localStorage.setItem('paike-username', loginForm.username)
      localStorage.setItem('paike-role', loginForm.role)
    } else {
      localStorage.removeItem('paike-username')
      localStorage.removeItem('paike-role')
    }

    // 6. 按角色动态跳转
    ElMessage.success(`登录成功！欢迎${userInfo.roleName}`)
    if (userInfo.role === '1') {
      await router.push('/layout/admin/home')
    } else {
      await router.push('/layout/teacher/home')
    }
  } catch (error) {
    // 细化错误提示
    console.error('登录请求异常：', error)
    if (error.response) {
      ElMessage.error(error.response.data?.message || '账号或密码错误，请重试')
    } else if (error.request) {
      // 网络异常兜底（仍保留avatar字段）
      ElMessage.warning('网络异常，临时模拟登录（仅页面跳转）')
      const mockToken = 'login-token-' + Date.now()
      localStorage.setItem('token', mockToken)
      userStore.setToken(mockToken)
      const userInfo = {
        username: loginForm.username,
        nickname: loginForm.username,
        avatar: '', // 兜底也保留avatar字段
        role: loginForm.role,
        roleName: loginForm.role === '1' ? '管理员' : '老师',
      }
      localStorage.setItem('big-user', JSON.stringify(userInfo))
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      userStore.setUserInfo(userInfo)
      // 兜底跳转
      if (loginForm.role === '1') {
        await router.push('/layout/admin/home')
      } else {
        await router.push('/layout/teacher/home')
      }
    } else {
      ElMessage.error('登录逻辑异常：' + (error.message || '请重试'))
    }
  } finally {
    loading.value = false
  }
}
// 优化注册逻辑：携带角色参数
const handleRegister = async () => {
  if (!registerFormRef.value) return
  try {
    await registerFormRef.value.validate()
    loading.value = true
    // 新增：传递角色参数
    await userRegister({
      username: registerForm.username,
      password: registerForm.password,
      phone: registerForm.phone,
      role: registerForm.role, // 注册角色
    })
    ElMessage.closeAll()
    ElMessage.success('注册成功！请登录')
    registerFormRef.value.resetFields()
    activeTab.value = 'login'
    // 注册后自动填充用户名
    loginForm.username = registerForm.username
    loginForm.role = registerForm.role
  } catch (error) {
    console.error('注册失败：', error)
    ElMessage.closeAll()
    ElMessage.error(error.message || '注册失败，请重试')
  } finally {
    loading.value = false
  }
}

// 优化忘记密码提示：更友好
const forgotPassword = () => {
  ElMessage.closeAll()
  ElMessage.info('请联系系统管理员重置密码，重置后初始密码为：123456')
}

// 优化标签切换逻辑
const handleTabChange = () => {
  if (activeTab.value === 'login') {
    loginForm.username = ''
    loginForm.password = ''
    loginFormRef.value?.resetFields()
    inputKey.value += 1
    setTimeout(() => {
      loginForm.username = ''
      loginForm.password = ''
    }, 200)
  } else {
    registerFormRef.value?.resetFields()
  }
}

// 优化初始化逻辑：记住角色
onMounted(() => {
  if (activeTab.value === 'login') {
    // 恢复记住的用户名和角色
    const savedUsername = localStorage.getItem('paike-username')
    const savedRole = localStorage.getItem('paike-role')
    if (savedUsername) {
      loginForm.username = savedUsername
      loginForm.rememberMe = true
    }
    if (savedRole) {
      loginForm.role = savedRole
    }
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}
.login-card {
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}
.header {
  text-align: center;
  margin-bottom: 30px;
}
.title {
  font-size: 42px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}
.subtitle {
  font-size: 16px;
  color: #666;
  font-weight: normal;
  margin-top: 5px;
}
.tabs {
  margin-bottom: 20px;
}
.form {
  margin-top: 20px;
}
.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}
:deep(.el-tabs__item) {
  font-size: 18px;
  font-weight: 500;
  height: 50px;
}
:deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 3px;
}
:deep(.el-input__wrapper) {
  border-radius: 24px;
  padding: 4px 15px;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea inset;
}
/* 新增：角色选择样式优化 */
:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
  margin-top: 5px;
}
:deep(.el-radio) {
  font-size: 16px;
}
</style>
