<template>
  <div class="course-reminder-page">
    <h2>课程提醒设置页</h2>
    <el-alert
      title="当前状态"
      :type="wsConnected ? 'success' : 'error'"
      :description="wsConnected ? '已连接课程提醒服务' : '未连接提醒服务'"
      show-icon
      :closable="false"
    />

    <!-- 新增：提醒配置表单 -->
    <el-card style="margin-top: 20px">
      <el-form :model="reminderConfig" label-width="160px" class="reminder-form">
        <el-form-item label="上课前提醒时间">
          <el-select v-model="reminderConfig.beforeClass" placeholder="请选择提醒时间">
            <el-option label="不提醒" :value="0" />
            <el-option label="课前5分钟" :value="5" />
            <el-option label="课前10分钟" :value="10" />
            <el-option label="课前15分钟" :value="15" />
          </el-select>
        </el-form-item>

        <el-form-item label="提醒方式">
          <el-checkbox v-model="reminderConfig.methods.inApp" disabled>站内实时提醒</el-checkbox>
          <el-checkbox v-model="reminderConfig.methods.sms" disabled
            >短信提醒（未开通）</el-checkbox
          >
          <el-checkbox v-model="reminderConfig.methods.email" disabled
            >邮件提醒（未开通）</el-checkbox
          >
        </el-form-item>

        <el-form-item label="已接收的提醒">
          <el-scrollbar height="200px" class="reminder-list">
            <div v-for="(item, index) in reminderList" :key="index" class="reminder-item">
              <span class="time">{{ item.time }}</span>
              <span class="content">{{ item.content }}</span>
            </div>
            <div v-if="reminderList.length === 0" class="empty-tip">暂无提醒消息</div>
          </el-scrollbar>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveConfig">保存配置</el-button>
          <el-button @click="clearReminder">清空提醒记录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const wsConnected = ref(false)
let ws = null
let reconnectTimer = null

// 新增：提醒配置（本地存储，无需后端接口）
const reminderConfig = reactive({
  beforeClass: 10, // 默认课前10分钟提醒
  methods: {
    inApp: true, // 站内提醒默认开启（WebSocket）
    sms: false, // 短信提醒默认关闭（标注未开通）
    email: false, // 邮件提醒默认关闭（标注未开通）
  },
})

// 新增：提醒消息列表
const reminderList = ref([])

// 初始化WebSocket连接（保留原有逻辑，新增消息存储）
const initWebSocket = () => {
  const teacherId = userStore.userInfo?.id || 1 // 优先用用户ID，无则用默认1

  if (!teacherId) {
    ElMessage.error('未获取到老师ID，无法连接提醒服务')
    return
  }

  const wsUrl = `ws://localhost:8080/schedule/ws/course-reminder?teacherId=${teacherId}`

  if (ws) {
    ws.close()
  }

  try {
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      wsConnected.value = true
      ElMessage.success('已连接课程提醒服务')
      if (reconnectTimer) {
        clearInterval(reconnectTimer)
        reconnectTimer = null
      }
      // 连接成功后加载本地配置
      loadConfig()
    }

    // 新增：接收消息后存储到列表
    ws.onmessage = (event) => {
      const reminderMsg = event.data
      // 添加到提醒列表
      reminderList.value.unshift({
        time: new Date().toLocaleString(),
        content: reminderMsg,
      })
      // 弹窗提醒
      ElMessage({
        type: 'warning',
        title: '课程提醒',
        message: reminderMsg,
        duration: 0,
        showClose: true,
      })
    }

    ws.onclose = (event) => {
      wsConnected.value = false
      if (event.code !== 1000) {
        ElMessage.warning('与提醒服务断开连接，将尝试重连...')
        reconnectTimer = setInterval(() => {
          initWebSocket()
        }, 5000)
      }
    }

    ws.onerror = (error) => {
      wsConnected.value = false
      ElMessage.error('提醒服务连接异常')
      console.error('WebSocket错误：', error)
    }
  } catch (error) {
    wsConnected.value = false
    ElMessage.error('创建WebSocket连接失败')
    console.error('创建WebSocket失败：', error)
  }
}

// 新增：加载本地存储的配置
const loadConfig = () => {
  const savedConfig = localStorage.getItem('reminderConfig')
  if (savedConfig) {
    Object.assign(reminderConfig, JSON.parse(savedConfig))
  }
}

// 新增：保存配置到本地存储
const saveConfig = () => {
  localStorage.setItem('reminderConfig', JSON.stringify(reminderConfig))
  ElMessage.success('提醒配置保存成功！')
  // 可扩展：如果有后端接口，这里可以调用接口保存到数据库
  // await saveReminderConfig(reminderConfig)
}

// 新增：清空提醒记录
const clearReminder = () => {
  reminderList.value = []
  ElMessage.info('已清空提醒记录')
}

// 页面挂载时初始化连接
onMounted(() => {
  initWebSocket()
})

// 页面卸载前关闭连接
onBeforeUnmount(() => {
  if (reconnectTimer) {
    clearInterval(reconnectTimer)
  }
  if (ws) {
    ws.close(1000, '页面卸载，主动关闭连接')
    ws = null
  }
})

onUnmounted(() => {
  wsConnected.value = false
})
</script>

<style scoped>
.course-reminder-page {
  padding: 20px;
}

.el-alert {
  margin-top: 20px;
}

.reminder-form {
  padding: 10px 0;
}

.reminder-list {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  padding: 10px;
}

.reminder-item {
  padding: 8px 0;
  border-bottom: 1px dashed #f0f0f0;
  display: flex;
  flex-direction: column;
}

.reminder-item:last-child {
  border-bottom: none;
}

.time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.content {
  font-size: 14px;
  color: #333;
}

.empty-tip {
  text-align: center;
  color: #999;
  line-height: 200px;
}

.el-checkbox.is-disabled {
  color: #666;
}
</style>
