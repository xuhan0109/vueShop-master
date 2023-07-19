<template>
  <div class="addContainer">
    <!-- 面包屑导航区域 -->
    <Breadcrumb :menuData="menuData"></Breadcrumb>
    
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加商品alert警告 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>

      <!-- 添加商品步骤条 -->
      <el-steps :active="activeIndex - 0" finish-status="success" class="margin_top" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 竖向的标签页 -->
      <el-form :model="goodsBasicInfo" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="tabPosition" style="margin-top:20px" :before-leave="beforeTabLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="goodsBasicInfo.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="goodsBasicInfo.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="goodsBasicInfo.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="goodsBasicInfo.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <el-cascader v-model="goodsBasicInfo.goods_cat" :options="categoriesList" :props="props" @change="handleChange"></el-cascader>
              </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in paramsList" :key="item.attr_id" >
              <p>{{item.attr_name}}</p>
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(value, index) in item.attr_vals" :key="index" :label="value"  border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              multiple
              :limit="3"
              :headers="headersObj"
              :on-success="handleSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="goodsBasicInfo.goods_introduce"
                ref="myQuillEditor"
                :options="editorOption">
            </quill-editor>

            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="imageDialogVisible"
      width="50%"
      @close="handleClose">
      <el-image style="width: 100%;" :src="previewPath"
      :fit="fit"></el-image>
    </el-dialog>
  </div>
</template>

<script>
  import Breadcrumb from '../../components/Breadcrumb.vue'
  // import Quill from 'quill'
  // import { someModule } from '../node_modules/someQuillModule.js'
  // Quill.register('modules/someModule', someModule)
  export default {
    components: { Breadcrumb },
    name: 'Add',
    data() {
      return {
        menuData: ['商品管理', '添加商品'],
        // 步骤条初始化显示
        activeIndex: '0',
        // 标签页的展示方向
        tabPosition: 'left',
        // 商品基本信息
        goodsBasicInfo: {
          goods_name: '',
          goods_cat: '',
          goods_price: 0,
          goods_number: 0,
          goods_weight: 0,
          goods_introduce: '',
          pics: [],
          attrs: []
        },
        // 商品分类列表数据
        categoriesList: [],
        // 基本信息填写校验规则
        rules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' },
          ],
          goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' },
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' },
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' },
          ],
          goods_cat: [
            { required: true, message: '请输入商品分类', trigger: 'blur' },
          ]
        },
        // 级联选择器props配置选项
        props: {
          children: 'children',
          label: 'cat_name',
          expandTrigger: 'hover',
          value: 'cat_id'
        },
        // 动态参数列表数据
        paramsList: [],
        // 静态属性列表数据
        onlyTableData: [],
        headersObj: {
          Authorization: sessionStorage.getItem('token')
        },
        // 图片预览地址
        previewPath: '',
        // 控制图片预览对话框显示隐藏
        imageDialogVisible: false,
        fit: 'fill',
        // 富文本编辑器配置
        editorOption: {

        }
      }
    },
    created () {
      this.getCategories()
    },
    methods: {
      // 获取商品分类数据列表
      async getCategories() {
        const {data: res} = await this.$http.get('categories')
        this.categoriesList = res.data
      },
      // 商品分类选中的值
      handleChange() {
        if(this.goodsBasicInfo.goods_cat.length !== 3) {
          return this.goodsBasicInfo.goods_cat = []
        }
      },
      beforeTabLeave() {
       if(this.activeIndex === '0' && this.goodsBasicInfo.goods_cat.length !== 3) {
         this.$message.error("请把分类参数填写完整！")
         return false
       }
      },
      async tabClick() {
        if(this.activeIndex === '1') {
          const {data: res} = await this.$http.get(`categories/${this.goodsBasicInfo.goods_cat[2]}/attributes`, {params:{sel: 'many'}})
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
          })
          console.log(res.data);
          this.paramsList = res.data
        } else if(this.activeIndex === '2') {
          const {data: res} = await this.$http.get(`categories/${this.goodsBasicInfo.goods_cat[2]}/attributes`, {params:{sel: 'only'}})
          console.log(res);
          this.onlyTableData = res.data
        }
      },
      // 处理图片预览效果
      handlePreview(file) {
        this.previewPath = file.response.data.url
        this.imageDialogVisible = true
      },
      // 处理移除图片的操作
      handleRemove(file) {
        const filePath = file.response.data.tmp_path
        const index = this.goodsBasicInfo.pics.findIndex(x => x.pic === filePath)
        this.goodsBasicInfo.pics.splice(index, 1)

      },
      // 图片上传成功的钩子
      handleSuccess(response) {
        this.goodsBasicInfo.pics.push({pic: response.data.tmp_path})
        console.log(this.goodsBasicInfo.pics);
      },
      // 监听图片预览对话框关闭
      handleClose() {
        this.previewPath = ""
      },
      // 添加商品
      add() {
        console.log(this.goodsBasicInfo);
        this.goodsBasicInfo.goods_cat = this.goodsBasicInfo.goods_cat.join(',')
        this.$refs.ruleForm.validate(async valid => {
          if(!valid) return this.$message.error("请填写必要的表单项")
          // 处理动态参数
          this.paramsList.forEach(item => {
            const newInfo = {attr_id: item.attr_id, attr_vals: item.attr_vals.join(',')}
            this.goodsBasicInfo.attrs.push(newInfo)
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {attr_id: item.attr_id, attr_vals: item.attr_vals}
            this.goodsBasicInfo.attrs.push(newInfo)
          })
          console.log(this.goodsBasicInfo);
          const {data: res} = await this.$http.post('goods', this.goodsBasicInfo)
          console.log(res);
        })
      }
    }
  }
</script>

<style scoped>
  .margin_top {
    margin-top: 20px;
  }

  .el-checkbox {
    margin-right: 10px !important;
  }

  .btnAdd {
    margin-top: 20px;
  }
</style>