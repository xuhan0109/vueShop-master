<template>
  <div class="cateContainer">
    <!-- 面包屑导航区域 -->
    <Breadcrumb :menuData="menuData"></Breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategories">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格展示区域 -->
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border>
        <template v-slot:isOk="scope">
          <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <template v-slot:cat_level="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-if="scope.row.cat_level === 2" type="warning">三级</el-tag>
        </template>
        <template v-slot:option="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="editCate(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>        
      </tree-table>

      <!-- 分页展示区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-size="params.pagesize"
        :page-sizes="[5,8]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>

    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addCateData" :rules="addCateFormRules" label-width="80px" class="demo-ruleForm" ref="addRightsRef">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateData.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_pid">
          <el-cascader v-model="parentValue" :options="parentCateList" :props="parentProps" @change="handleChange" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogClosed">取 消</el-button>
        <el-button type="primary" @click="submitAddCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%" @close="cancelEditCate">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditCate">取 消</el-button>
        <el-button type="primary" @click="submitEditCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import Breadcrumb from '../../components/Breadcrumb'
  export default {
    name: 'Cate',
    components: {
      Breadcrumb
    },
    data() {
      return {
        // 传给面包屑的数据
        menuData: ['商品管理','商品分类'],
        // 获取商品分类数据的参数
        params: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        // 编辑分类对话框数据
        editForm: {},
        // 商品分类数据
        cateList: [],
        // 总数据条数
        total: 0,
        // tree-table的列数据内容
        columns: [
          {label: '分类名称', prop: 'cat_name'},
          {label: '是否有效', prop: 'cat_deleted', type: 'template',template: 'isOk'},
          {label: '排序', prop: 'cat_level', type: 'template',template: 'cat_level'},
          {label: '操作', type: 'template',template: 'option'},
        ],
        // 监听添加分类对话框显示隐藏
        addDialogVisible: false,
        // 监听编辑分类对话框显示隐藏
        editDialogVisible: false,
        // 添加分类的数据
        addCateData: {
          cat_pid: 0,
          cat_name: '',
          cat_level: 0
        },
        // 验证规则
        addCateFormRules: {
          cat_name: [
             { required: true, message: '请输入活动名称', trigger: 'blur' }
          ]
        },
        // 父级分类列表
        parentCateList: [],
        // 父级分类列表选择
        parentValue: [],
        // 指定级联选择器的配置对象
        parentProps: {label: 'cat_name', value: 'cat_id',expandTrigger: 'hover', children: 'children',checkStrictly: true}
      }
    },
    created () {
      this.getCategories()
    },
    methods: {
      // 获取所有商品分类数据
      async getCategories() {
        const {data: res} = await this.$http.get('categories', {params: this.params})
        if(res.meta.status !== 200) return this.$message.error("获取商品分类数据失败！")
        this.$message.success("获取商品分类数据成功！")
        this.cateList = res.data.result
        this.total = res.data.total
      },
      // 添加分类
      async addCategories() {
        this.addDialogVisible = true
        const {data: res} = await this.$http.get('categories', {params: {type: 2}})
        if(res.meta.status !== 200) return this.$message.error("获取商品分类数据失败！")
        this.$message.success("获取商品分类数据成功！")
        // console.log(res.data);
        this.parentCateList = res.data
      },
      // 编辑商品分类
      editCate(cateInfo) {
        this.editDialogVisible = true
        this.editForm = cateInfo
      },
      // 监听添加分类对话框隐藏
      addDialogClosed() {
        this.addDialogVisible = false
        this.$refs.addRightsRef.resetFields()
        this.addCateData.cat_pid = 0
        this.addCateData.cat_level = 0
        this.parentValue = []
      },
      // 监听页码的变化并更新页面数据
      handleCurrentChange(newPageNum) {
        this.params.pagenum = newPageNum
        this.getCategories()
      },
      // 监听条数的变化
      handleSizeChange(newSize) {
        this.params.pagesize = newSize
        this.getCategories()
      },
      // 监听用户选择的父级分类选项
      handleChange() {
        if(this.parentValue.length > 0) {
          this.addCateData.cat_pid = this.parentValue[this.parentValue.length - 1];
          this.addCateData.cat_level = this.parentValue.length
          return
        }else {
          this.addCateData.cat_pid = 0
          this.addCateData.cat_level = 0
        }
      },
      // 提交添加的分类
      submitAddCate() {
        this.$refs.addRightsRef.validate(async valid => {
          if(!valid) return
          const {data: res} = await this.$http.post('categories', this.addCateData)
          console.log(res);
          if(res.meta.status != 201) return this.$message.error("创建分类失败！")
          this.$message.success("创建分类成功！")
          this.getCategories()
          this.addDialogVisible = false
        })
      },
      // 删除分类
      deleteCate(id) {
        this.$confirm('是否删除该商品分类?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data: res} = await this.$http.delete(`categories/${id}`)
          if(res.meta.status !== 200) return this.$message.error("删除失败！")
          this.$message.success('删除成功!')
          this.getCategories()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        })
      },
      // 取消编辑分类名称
      cancelEditCate() {
        this.editDialogVisible = false
      },
      // 提交编辑的分类名称
      async submitEditCate() {
        const {data: res} = await this.$http.put(`categories/${this.editForm.cat_id}`, {cat_name: this.editForm.cat_name})
        if(res.meta.status !== 200) return this.$message.error("更新失败！")
        this.$message.success("更新成功！")
        this.getCategories()
        this.editDialogVisible = false
      }
    }
  }
</script>

<style scoped>
  .zk-table {
    font-size: 14px !important;
    color: #606266;
    margin-top: 20px;
  }

  .el-pagination {
    margin-top: 20px;
  }

  .el-cascader {
    width: 100%;
  }
</style>