import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例，配置后端基础路径（包含 /schedule 上下文）
const request = axios.create({
  baseURL: 'http://localhost:8080/schedule',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器：自动携带 Token，格式严格遵循 Bearer + 空格 + Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}` // 去除 Token 首尾空格，避免格式错误
    }
    return config
  },
  (error) => {
    console.error('请求拦截器错误：', error)
    return Promise.reject(error)
  },
)

// 响应拦截器：精准处理各类错误，兼容后端返回格式
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 后端返回 code !== 200 时，提示错误但不阻断 Promise 链（兼容部分特殊场景）
    if (res.code !== 200) {
      ElMessage.error(res.message || res.msg || '操作失败')
      return Promise.reject(res)
    }
    // 成功响应直接返回数据，方便前端解构
    return res
  },
  (error) => {
    console.error('响应拦截器错误：', error)
    // 401 未授权：清空无效 Token，强制跳登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('big-user')
      localStorage.removeItem('paike-username')
      // 跳登录并携带当前页面路径，登录后可返回原页面
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.fullPath },
      })
      ElMessage.error('登录失效/未授权，请重新登录')
    }
    // 404 接口不存在：提示检查后端地址
    else if (error.response?.status === 404) {
      ElMessage.error('接口不存在，请检查后端服务是否启动或路径是否正确')
    }
    // 500 服务器错误：提示联系管理员
    else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    }
    // 网络异常/超时：通用提示
    else {
      ElMessage.error(error.message || '网络异常，请检查网络连接')
    }
    return Promise.reject(error)
  },
)

export default request
