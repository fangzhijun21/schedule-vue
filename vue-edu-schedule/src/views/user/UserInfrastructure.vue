<template>
  <!-- 仅保留子路由内容出口，删除所有内层侧边导航 -->
  <div class="user-content">
    <router-view />
  </div>
</template>

<script setup>
// 无任何脚本逻辑，仅作为路由承载容器
</script>

<style scoped>
/* 适配外层布局的样式，保证子页面显示正常 */
.user-content {
  width: 100%;
  height: calc(100vh - 120px);
  padding: 20px;
  background: #f5f7fa;
  box-sizing: border-box; /* 防止padding导致内容溢出 */
}

/* 兼容子页面的el-card样式，避免间距错乱 */
:deep(.el-card) {
  margin: 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
