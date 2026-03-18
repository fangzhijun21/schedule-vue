import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'big-user', // 保持你原有的命名空间，不用改
  () => {
    // 1. 初始化：优先读取你登录页存的 `big-user`，兼容 `userInfo`
    const token = ref(localStorage.getItem('token') || '')

    // 关键修复：先读 big-user（你登录页存的键），再读 userInfo
    let initUserInfo = {}
    const bigUser = localStorage.getItem('big-user')
    const userInfoLocal = localStorage.getItem('userInfo')
    if (bigUser) {
      initUserInfo = JSON.parse(bigUser)
    } else if (userInfoLocal) {
      initUserInfo = JSON.parse(userInfoLocal)
    }
    const userInfo = ref(initUserInfo)

    // 2. 定义方法（适配你的登录逻辑）
    // 设置 token
    const setToken = (newToken) => {
      token.value = newToken
      localStorage.setItem('token', newToken)
    }

    // 移除 token
    const removeToken = () => {
      token.value = ''
      localStorage.removeItem('token')
    }

    // 设置用户信息：同时存 big-user 和 userInfo（兼容你的登录页）
    const setUserInfo = (info) => {
      userInfo.value = info
      localStorage.setItem('big-user', JSON.stringify(info)) // 匹配你登录页的键
      localStorage.setItem('userInfo', JSON.stringify(info)) // 兜底
    }

    // 移除用户信息：同时清空两个键
    const removeUserInfo = () => {
      userInfo.value = {} // 用空对象而非 null，避免取值报错
      localStorage.removeItem('big-user')
      localStorage.removeItem('userInfo')
    }

    // 退出登录（清空所有）
    const logout = () => {
      removeToken()
      removeUserInfo()
      // 顺便清空你登录页的记住密码相关
      localStorage.removeItem('paike-username')
      localStorage.removeItem('paike-role')
    }

    // 3. 返回需要暴露的状态和方法
    return {
      token,
      userInfo,
      setToken,
      removeToken,
      setUserInfo,
      removeUserInfo,
      logout,
    }
  },
  {
    persist: true, // 保持持久化配置
  },
)
