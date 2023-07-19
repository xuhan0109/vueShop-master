<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item v-for="(menu, index) in menuData" :key="index">{{menu}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
  export default {
    name: 'Breadcrumb',
    props: {
      menuData: {
        type: Array,
        default: () => []
      }
    }
  }
</script>

<style>

</style>