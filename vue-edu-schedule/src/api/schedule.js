/**
 * 课表管理相关接口
 * 所有接口均使用封装后的 request 实例，自动携带 Token 并处理基础异常
 */
import request from '../utils/request'

// 查询课表列表（支持条件筛选）
export function getScheduleList(params) {
  return request({
    url: '/api/schedules',
    method: 'GET',
    params,
  })
}

// 新增课表
export function addSchedule(data) {
  return request({
    url: '/api/schedules',
    method: 'POST',
    data,
  })
}

// 更新课表
export function updateSchedule(id, data) {
  return request({
    url: `/api/schedules/${id}`,
    method: 'PUT',
    data,
  })
}

// 删除课表
export function deleteSchedule(id) {
  return request({
    url: `/api/schedules/${id}`,
    method: 'DELETE',
  })
}

// 根据ID获取单个课表详情
export function getScheduleById(id) {
  return request({
    url: `/api/schedules/${id}`,
    method: 'GET',
  })
}

// 根据课程ID获取对应老师的全量课表
export function getTeacherScheduleByCourseId(courseId) {
  return request({
    url: `/api/schedules/teacher-schedule/${courseId}`,
    method: 'GET',
  })
}
