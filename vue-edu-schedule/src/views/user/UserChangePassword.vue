<template>
  <div class="user-profile-container">
    <el-card class="profile-card">
      <!-- 个人信息区 -->
      <div class="profile-header">
        <div class="avatar-section">
          <!-- 核心：加 :key 强制刷新头像 -->
          <el-avatar
            :size="100"
            :src="userInfo.avatar || defaultAvatar"
            :key="userInfo.avatar"
            class="avatar"
          ></el-avatar>
          <!-- 更换头像按钮 -->
          <el-button type="primary" plain @click="handleAvatarUpload" style="margin-top: 10px">
            更换头像
          </el-button>
          <!-- 隐藏的文件输入框 -->
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleAvatarChange"
          />
        </div>
        <div class="info-section">
          <h2 class="info-title">个人信息</h2>
          <el-form :model="profileForm" label-width="120px" class="profile-form">
            <el-form-item label="账号">
              <el-input v-model="profileForm.username" disabled size="large" />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称" size="large" />
            </el-form-item>
            <el-form-item label="角色">
              <el-input v-model="profileForm.role" disabled size="large" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile">保存个人信息</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <el-divider />

      <!-- 修改密码区 -->
      <div class="password-section">
        <h3 class="password-title">修改密码</h3>
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="120px"
          class="password-form"
        >
          <el-form-item label="原密码" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password
              size="large"
            />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（6-20位）"
              show-password
              size="large"
            />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="再次输入新密码"
              show-password
              size="large"
            />
          </el-form-item>
          <el-form-item>
            <!-- 修复：加 @click.stop 确保按钮可点击 -->
            <el-button type="primary" @click.stop="handleChangePassword">确认修改密码</el-button>
            <el-button @click="resetPasswordForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { changePassword, updateAvatar, updateProfile } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

// 默认头像
const defaultAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')

// 用户信息（响应式）
const userInfo = reactive({
  username: '',
  nickname: '',
  role: '管理员',
  avatar: defaultAvatar.value,
})

// 头像上传 input 引用
const avatarInputRef = ref(null)

// 个人信息表单
const profileForm = reactive({
  username: '',
  nickname: '',
  role: '管理员',
})

// 修改密码表单
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 密码校验规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'change' },
  ],
}

// ==================== 核心强化：onMounted 初始化逻辑 ====================
onMounted(() => {
  console.log('===== 开始初始化用户信息 =====')

  // 1. 读取所有缓存源
  const bigUserStr = localStorage.getItem('big-user')
  const userInfoStr = localStorage.getItem('userInfo')
  const piniaUser = userStore.userInfo || {}

  let finalUser = {}

  // 2. 优先级：big-user > userInfo > Pinia
  if (bigUserStr) {
    try {
      finalUser = JSON.parse(bigUserStr)
      console.log('从 big-user 读取到：', finalUser)
    } catch (e) {
      console.error('解析 big-user 失败', e)
    }
  } else if (userInfoStr) {
    try {
      finalUser = JSON.parse(userInfoStr)
      console.log('从 userInfo 读取到：', finalUser)
    } catch (e) {
      console.error('解析 userInfo 失败', e)
    }
  } else if (piniaUser.username) {
    finalUser = piniaUser
    console.log('从 Pinia 读取到：', finalUser)
  }

  // 3. 强制赋值给响应式对象
  if (finalUser.username) {
    // 基础信息
    userInfo.username = finalUser.username || ''
    userInfo.nickname = finalUser.nickname || ''
    userInfo.role = finalUser.role || '管理员'

    // 核心：头像赋值（如果缓存里没有，就用默认）
    userInfo.avatar = finalUser.avatar || defaultAvatar.value

    // 表单同步
    profileForm.username = userInfo.username
    profileForm.nickname = userInfo.nickname
    profileForm.role = userInfo.role

    // 同步回 Pinia，保证数据一致
    userStore.setUserInfo(finalUser)

    console.log('✅ 初始化完成，最终头像：', userInfo.avatar)
  } else {
    console.warn('⚠️ 未找到用户缓存，使用默认值')
    userInfo.avatar = defaultAvatar.value
  }
})

// 点击更换头像按钮
const handleAvatarUpload = () => {
  nextTick(() => {
    if (avatarInputRef.value) {
      avatarInputRef.value.click()
    } else {
      ElMessage.error('头像上传组件加载失败，请刷新页面重试')
    }
  })
}

// ==================== 核心强化：上传头像并持久化 ====================
const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await updateAvatar(formData)

    console.log('后端返回：', res)

    if (res.code === 200) {
      const newAvatar = res.data

      // 1. 更新页面显示（实时生效）
      userInfo.avatar = newAvatar

      // 2. 构建最新的用户对象
      const updatedUser = {
        ...userStore.userInfo,
        username: userInfo.username,
        nickname: userInfo.nickname,
        role: userInfo.role,
        avatar: newAvatar,
      }

      // 3. 同步到所有存储位置（三管齐下，保证刷新不丢）
      userStore.setUserInfo(updatedUser)
      localStorage.setItem('big-user', JSON.stringify(updatedUser))
      localStorage.setItem('userInfo', JSON.stringify(updatedUser))

      console.log('✅ 头像已保存到所有缓存：', updatedUser)
      ElMessage.success('更换头像成功')
    } else {
      ElMessage.error(res.message || '头像更新失败')
    }
  } catch (err) {
    console.error('上传失败：', err)
    ElMessage.error('头像上传失败')
  } finally {
    e.target.value = ''
  }
}

// 保存个人信息
const handleUpdateProfile = async () => {
  try {
    await updateProfile({ nickname: profileForm.nickname })

    const updatedUser = {
      ...userStore.userInfo,
      nickname: profileForm.nickname,
    }

    userStore.setUserInfo(updatedUser)
    localStorage.setItem('big-user', JSON.stringify(updatedUser))
    localStorage.setItem('userInfo', JSON.stringify(updatedUser))

    userInfo.nickname = profileForm.nickname
    ElMessage.success('个人信息保存成功')
  } catch (err) {
    console.error('保存失败：', err)
    ElMessage.error('保存个人信息失败')
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  try {
    await passwordFormRef.value.validate()
  } catch (err) {
    ElMessage.error('请完善密码表单')
    return
  }

  try {
    const res = await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    })

    if (res.code === 200) {
      ElMessage.success('密码修改成功，下次登录请使用新密码')
      resetPasswordForm()
    } else {
      ElMessage.error(res.message || '密码修改失败')
    }
  } catch (err) {
    console.error('修改失败：', err)
    ElMessage.error('修改密码请求失败')
  }
}

const resetPasswordForm = () => {
  passwordFormRef.value?.resetFields()
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}
</script>

<style scoped>
.user-profile-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  padding: 10px 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  border: 2px solid #eee;
}

.info-section {
  flex: 1;
}

.info-title {
  margin-bottom: 24px;
}

.profile-form,
.password-form {
  margin-left: 0;
  padding-left: 0;
}

.profile-form :deep(.el-form-item),
.password-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.profile-form :deep(.el-form-item__label),
.password-form :deep(.el-form-item__label) {
  padding-right: 10px;
  text-align: left;
}

.profile-form :deep(.el-input),
.password-form :deep(.el-input) {
  width: 300px;
}

.password-section {
  margin-top: 20px;
  padding-top: 10px;
  padding-left: 140px;
}

.password-title {
  margin-bottom: 20px;
}

:deep(.el-form-item__content) {
  display: flex;
  gap: 15px;
}
</style>
