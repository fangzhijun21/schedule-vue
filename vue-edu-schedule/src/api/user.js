import request from '../utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录参数 {username, password, role}
 * @returns {Promise}
 */
export const userLogin = (data) => {
  // 严格匹配后端：POST /api/sysusers/login
  // 补充role参数默认值，适配前端角色选择
  const loginData = {
    username: data.username?.trim() || '',
    password: data.password?.trim() || '',
    role: data.role || 2, // 默认2=老师，1=管理员
  }
  return request.post('/api/sysusers/login', loginData)
}

/**
 * 用户注册
 * @param {Object} data - 注册参数 {username, password, phone, role}
 * @returns {Promise}
 */
export const userRegister = (data) => {
  // 严格匹配后端：POST /api/sysusers
  const registerData = {
    username: data.username?.trim() || '',
    password: data.password?.trim() || '',
    phone: data.phone?.trim() || '',
    role: data.role || 2, // 默认注册为老师
  }
  return request.post('/api/sysusers', registerData)
}

/**
 * 修改当前登录用户密码
 * @param {Object} data - 密码参数 {oldPassword, newPassword}
 * @returns {Promise}
 */
export const changePassword = (data) => {
  // 匹配后端：POST /api/sysusers/changePassword
  const pwdData = {
    oldPassword: data.oldPassword?.trim() || '',
    newPassword: data.newPassword?.trim() || '',
  }
  return request.post('/api/sysusers/changePassword', pwdData, {
    headers: {
      // 携带登录Token，后端需要校验
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  })
}

/**
 * 获取用户信息（补充接口，后端若未实现可先保留）
 * @returns {Promise}
 */
export const getUserInfo = () => {
  // 后端若未实现该接口，可暂时注释，或让后端补充 GET /api/sysusers/info
  return request.get('/api/sysusers/info', {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  })
}

/**
 * 获取验证码（后端未实现，暂时注释，避免前端调用报错）
 * @param {Object} data - 参数 {phone}
 * @returns {Promise}
 */
// export const getVerifyCode = (data) => {
//   return request.post('/api/sysusers/verify-code', data)
// }

/**
 * 普通用户重置密码（后端未实现，改用管理员重置接口，注释该接口）
 * @param {Object} data - 参数 {phone, code, newPassword}
 * @returns {Promise}
 */
// export const resetPassword = (data) => {
//   return request.post('/api/sysusers/reset-password', data)
// }

/**
 * 管理员重置用户密码（核心新增，匹配后端/admin/resetPassword接口）
 * @param {Object} data - 参数 {userId, newPassword}
 * @returns {Promise}
 */
export const adminResetPassword = (data) => {
  // 匹配后端：POST /api/sysusers/admin/resetPassword
  const resetData = {
    userId: data.userId, // 必传：要重置密码的用户ID
    newPassword: data.newPassword || '123456', // 可选：默认123456
  }
  return request.post('/api/sysusers/admin/resetPassword', resetData, {
    headers: {
      // 必须携带管理员Token，后端校验权限
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  })
}

/**
 * 更新用户头像
 * @param {FormData} formData - 头像文件 FormData，格式：{avatar: File}
 * @returns {Promise}
 */
export const updateAvatar = (formData) => {
  // 匹配后端：POST /api/sysusers/avatar
  return request.post('/api/sysusers/avatar', formData, {
    withCredentials: false,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: 'Bearer ' + localStorage.getItem('token'), // 携带Token
    },
  })
}

/**
 * 更新个人信息（昵称）
 * @param {Object} data - {nickname}
 * @returns {Promise}
 */
export const updateProfile = (data) => {
  // 匹配后端：POST /api/sysusers/profile
  const profileData = {
    nickname: data.nickname?.trim() || '',
  }
  return request.post('/api/sysusers/profile', profileData, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'), // 携带Token
    },
  })
}

/**
 * 分页查询用户列表（管理员功能，补充接口）
 * @param {Object} params - 查询参数 {username, pageNum, pageSize}
 * @returns {Promise}
 */
export const getUserList = (params) => {
  // 匹配后端：GET /api/sysusers
  const queryParams = {
    username: params.username?.trim() || '',
    pageNum: params.pageNum || 1,
    pageSize: params.pageSize || 10,
  }
  return request.get('/api/sysusers', {
    params: queryParams,
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  })
}

/**
 * 删除用户（管理员功能，补充接口）
 * @param {Number|String} id - 用户ID
 * @returns {Promise}
 */
export const deleteUser = (id) => {
  // 匹配后端：DELETE /api/sysusers/{id}
  return request.delete(`/api/sysusers/${id}`, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  })
}

/**
 * 更新用户信息（管理员功能，补充接口）
 * @param {Number|String} id - 用户ID
 * @param {Object} data - 用户信息 {username, nickname, role, phone}
 * @returns {Promise}
 */
export const updateUser = (id, data) => {
  // 匹配后端：PUT /api/sysusers/{id}
  return request.put(`/api/sysusers/${id}`, data, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  })
}
