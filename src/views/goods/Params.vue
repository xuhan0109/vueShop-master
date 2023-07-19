<template>
  <div class="paramsContainer">
    <!-- 面包屑导航区域 -->
    <Breadcrumb :menuData="menuData"></Breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- alert警告 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      
      <!-- 选择商品分类级联选择器 -->
      <el-form>
        <el-form-item label="选择商品分类：">
          <el-cascader v-model="parentCateKeys" :options="parentCateList" :props="parentProps" @change="handleChange" clearable></el-cascader>
        </el-form-item>
      </el-form>

      <!-- 展示动态参数及静态属性的标签页区域 -->
      <el-tabs v-model="paramsAndAttr" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-row>
            <el-col>
              <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParams">添加参数</el-button>
            </el-col>
          </el-row>
          <!-- 动态参数表格展示区域 -->
          <el-table :data="tableData" style="width: 100%" border>
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-row class="rowTag">
                  <el-col>
                    <el-tag closable v-for="(item, index) in props.row.attr_vals" :key="index" @close="handleClose(index, props.row)">{{item}}</el-tag>
                    <el-input class="input-new-tag" v-if="props.row.inputVisible" v-model="props.row.inputValue" ref="saveTagInput" size="small"  @keyup.enter.native="handleInputConfirm(props.row)" @blur="handleInputConfirm(props.row)"
                    />
                    <el-button v-else class="button-new-tag" size="small"  @click="showInput(props.row)">+ New Tag</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"> </el-table-column>
            <el-table-column label="参数名称" prop="attr_name"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" class="el-icon-edit" size="mini" @click="editDynamicParams(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" class="el-icon-delete" size="mini" @click="delStaticAttributes(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-row>
            <el-col>
              <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addAttributes">添加属性</el-button>
            </el-col>
          </el-row>
          <!-- 静态属性表格展示区域 -->
          <el-table :data="tableData" style="width: 100%" border>
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-row class="rowTag">
                  <el-col>
                    <el-tag closable v-for="(item, index) in props.row.attr_vals" :key="index" @close="handleClose(index, props.row)">{{item}}</el-tag>
                    <el-input class="input-new-tag" v-if="props.row.inputVisible" v-model="props.row.inputValue" ref="saveTagInput" size="small"  @keyup.enter.native="handleInputConfirm(props.row)" @blur="handleInputConfirm(props.row)"
                    />
                    <el-button v-else class="button-new-tag" size="small"  @click="showInput(props.row)">+ New Tag</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"> </el-table-column>
            <el-table-column label="属性名称" prop="attr_name"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" class="el-icon-edit" size="mini" @click="editStaticAttributes(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" class="el-icon-delete" size="mini" @click="delStaticAttributes(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数或静态属性对话框 -->
    <el-dialog :title="title" :visible.sync="dialogVisible" width="50%" @close="dialogVisibleClosed">
      <el-form :model="formData" class="demo-ruleForm" :rules="rules"  ref="formDataRef">
        <el-form-item :label="label" label-width="80px" prop="attr_name">
          <el-input v-model="formData.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitFormData">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑动态参数或静态属性对话框 -->
    <el-dialog :title="editTitle" :visible.sync="editDialogVisible" width="50%" @close="editDialogVisibleClosed">
      <el-form :model="editFormData" class="demo-ruleForm" :rules="rules" ref="editFormDataRef">
        <el-form-item :label="editLabel" label-width="80px" prop="attr_name">
          <el-input v-model="editFormData.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditFormData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import Breadcrumb from '../../components/Breadcrumb'
  export default {
    name: 'Params',
    components: {
      Breadcrumb
    },
    data() {
      return {
        // 面包屑参数
        menuData: ['商品管理','分类参数'],
        // 商品分类数据以及参数
        parentCateKeys: [],
        parentCateList: [],
        // 获商品分类参数
        params: {
          type: 3
        },
        // 指定显示的是动态参数还是静态属性
        paramsAndAttr: 'many',
        // 商品分类id
        cateClassifyId: 0,
        // 指定级联选择器的配置对象
        parentProps: {label: 'cat_name', value: 'cat_id',expandTrigger: 'hover', children: 'children'},
        // 动态参数和静态属性数据
        tableData: [],
        // 添加动态参数或静态属性的标题
        title: '',
        editTitle: '',
        // 添加动态参数或静态属性的名称
        label: '',
        editLabel: '',
        // 控制添加动态参数或静态属性对话框的显示隐藏
        dialogVisible: false,
        // 控制编辑动态参数或静态属性对话框的显示隐藏
        editDialogVisible: false,
        // form表单规则
        rules: {
          attr_name: [
            { required: true, message: '请输入名称', trigger: 'blur' },
          ]
        },
        // 添加表单数据
        formData: {
          id: 0,
          attr_name: '',
          attr_sel: '',
          attr_vals: ''
        },
        // 编辑表单数据
        editFormData: {},
        // 保存用户输入的tag值
        dynamicTags: []
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
        this.parentCateList = res.data
      },
      // 获取用户选择的商品分类id
      handleChange(value) {
        if(value.length === 3) {
          this.cateClassifyId = value[value.length - 1]
          this.getParamsList(this.paramsAndAttr)
        } else {
          this.parentCateKeys = []
          this.tableData = []
        }
      },
      // 点击切换动态参数或静态属性分页，级联选择器中有数据时，才获取参数列表的接口
      handleClick() {
        if(this.parentCateKeys.length > 0) {
          this.getParamsList(this.paramsAndAttr)
        }
      },
      // 获取参数列表，如果是only：静态参数，many：动态参数
      async getParamsList(sel) {
        const {data: res} = await this.$http.get(`categories/${this.cateClassifyId}/attributes`, {params: {sel: sel}})
        console.log(res);
        res.data.filter(item => {
          // 控制文本框显示隐藏
          item.inputVisible = false
          // 文本框中输入的值
          item.inputValue = ''
          item.attr_vals = item.attr_vals.split(',').filter(val => val !== '')
          return item
        })
        console.log(res.data);
        this.tableData = res.data
      },
      // 修改静态属性
      editStaticAttributes(attr_id) {
        this.editDialogVisible = true
        this.editTitle = '修改静态属性'
        this.editLabel = '静态属性'
        this.editFormData.attr_sel = this.paramsAndAttr
        this.editParamsOrAttributes(attr_id)
      },
      // 修改动态参数
      editDynamicParams(attr_id) {
        this.editDialogVisible = true
        this.editTitle = '修改动态参数'
        this.editLabel = '动态参数'
        this.editFormData.attr_sel = this.paramsAndAttr
        this.editParamsOrAttributes(attr_id)
      },
      // 删除静态属性或动态参数
      delStaticAttributes(attr_id) {
        this.$confirm('是否删除该属性?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data: res} = await this.$http.delete(`categories/${this.cateClassifyId}/attributes/${attr_id}`)
          if(res.meta.status !== 200) return this.$message.error("删除失败！")
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getParamsList(this.paramsAndAttr)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      // 添加动态参数
      addParams() {
        this.dialogVisible = true
        this.title = '添加动态参数'
        this.label = '动态参数'
        this.formData.id = this.cateClassifyId
        this.formData.attr_sel = this.paramsAndAttr
      },
      // 添加静态属性
      addAttributes() {
        this.dialogVisible = true
        this.title = '添加静态属性'
        this.label = '静态属性'
        this.formData.id = this.cateClassifyId
        this.formData.attr_sel = this.paramsAndAttr
      },
      // 监听添加对话框关闭
      dialogVisibleClosed() {
        this.$refs.formDataRef.resetFields()
      },
      // 监听编辑对话框关闭
      editDialogVisibleClosed(){
        this.$refs.editFormDataRef.resetFields()
      },
      // 提交form表单数据
      submitFormData() {
        this.$refs.formDataRef.validate(valid => {
          if(valid) {
            this.addParamsOrAttributes(this.formData.id, this.formData)
          }
        })
      },
      // 提交编辑后的form表单
      submitEditFormData() {
        // 编辑提交参数
        this.$refs.editFormDataRef.validate(async valid => {
          if(valid) {
            const {data: editRes} = await this.$http.put(`categories/${this.cateClassifyId}/attributes/${this.editFormData.attr_id}`, this.editFormData)
            if(editRes.meta.status !== 200) return this.$message.error("修改失败！")
            this.$message.success("修改成功！")
            this.getParamsList(this.paramsAndAttr)
            this.editDialogVisible = false
          }
        })
      },
      // 添加动态参数或静态属性的方法
      async addParamsOrAttributes(id, params) {
        console.log(typeof id, params);
        const {data: res} = await this.$http.post(`categories/${id}/attributes`, params)
        if(res.meta.status !== 201) return this.$message.error("创建失败！")
        this.$message.success("创建成功！")
        this.getParamsList(this.paramsAndAttr)
        this.dialogVisible = false
      },
      // 修改动态参数或静态属性的方法
      async editParamsOrAttributes(attr_id) {
        // 根据 ID 查询参数
        const {data: res} = await this.$http.get(`categories/${this.cateClassifyId}/attributes/${attr_id}`)
        if(res.meta.status !== 200) return this.$message.error("获取失败！")
        this.$message.success("获取成功！")
        this.editFormData = res.data
      },
      // 获取用户在input中输入的值
      async handleInputConfirm(row) {
        console.log(row);
        let inputValue = row.inputValue;
        if (inputValue) {
          row.attr_vals.push(inputValue);
        }
        const {data: editRes} = await this.$http.put(`categories/${this.cateClassifyId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        })
        console.log(editRes);
        if(editRes.meta.status !== 200) return this.$message.error("修改失败！")
        this.$message.success("修改成功！")
        // this.getParamsList(this.paramsAndAttr)
        row.inputVisible = false;
        row.inputValue = '';
      },
      // 点击显示input框
      showInput(row) {
        row.inputVisible = true;
        this.$nextTick(() => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      // 删除参数项
      handleClose(index, row) {
        row.attr_vals.splice(index, 1)
        this.handleInputConfirm(row)
      }
    },
    computed: {
      isBtnDisabled() {
        if(this.parentCateKeys.length !== 3) {
          return true
        } else {
          return false
        }
      }
    }
  }
</script>

<style scoped>
  .el-form {
    margin-top: 20px;
  }

  .el-cascader {
    width: 260px !important;
  }

  .el-table {
    margin-top: 20px;
  }

  .el-tag {
    margin: 5px;
  }
  
  .rowTag {
    padding: 10px 48px;
    box-sizing: border-box;
  }

  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    /* vertical-align: bottom; */
  }
</style>