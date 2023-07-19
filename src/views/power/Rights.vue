<template>
  <div class="rightsContainer">
    <!-- 面包屑导航区域 -->
    <Breadcrumb  :menuData="menuData"></Breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-table :data="rightsList" border style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="authName" label="权限名称"> </el-table-column>
        <el-table-column prop="path" label="路径"> </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-if="scope.row.level === '2'" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  import Breadcrumb from '../../components/Breadcrumb'
  export default {
    name: 'Rights',
    components: {
      Breadcrumb
    },
    data() {
      return {
        // 传给面包屑的数据
        menuData: ['权限管理','权限列表'],
        // 权限列表数据
        rightsList: []
      }
    },
    created () {
      this.getRightsList()
    },
    methods: {
      async getRightsList() {
        const {data: res} = await this.$http.get('rights/list')
        console.log(res);
        if(res.meta.status !== 200) return
        this.rightsList = res.data
      }
    }
  }
</script>

<style>

</style>