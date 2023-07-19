<template>
  <div class="goodsContainer">
    <!-- 面包屑导航区域 -->
    <Breadcrumb :menuData="menuData"></Breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="cleatInput">
            <el-button slot="append" icon="el-icon-search" @click="searchGoods(queryInfo.query)"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表展示区域 -->
      <el-table :data="goodsList" border style="width: 100%; margin: 20px 0">
        <el-table-column type="index" label="#" width="60px"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称" > </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px"> </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100px"> </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180px"> </el-table-column>
        <el-table-column label="操作" width="140px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editGoods(scope.row)"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="delGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[6, 8, 10, 12]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

    </el-card>

    
      <!-- 编辑商品信息对话框 -->
      <el-dialog
        title="编辑商品信息"
        :visible.sync="editDialog"
        width="50%"
        :before-close="handleClose">
        <el-form :model="goodInfo"  ref="goodRef" label-width="100px" class="demo-ruleForm">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="goodInfo.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="goodInfo.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="goodInfo.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="goodInfo.goods_weight"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">取 消</el-button>
          <el-button type="primary" @click="submitEditGoodInfo">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
  import Breadcrumb from '../../components/Breadcrumb.vue'
  export default {
    name: 'Goods',
    components: { Breadcrumb },
    data() {
      return {
        menuData: ['商品管理', '商品列表'],
        // 获取商品列表参数项
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 8
        },
        // 保存获取商品列表数据的总数
        total: 0,
        // 保存获取的商品列表数据
        goodsList: [],
        goodInfo: {},
        editDialog: false
      }
    },
    created () {
      this.getGoodsList()
    },
    methods: {
      // 获取商品列表数据
      async getGoodsList() {
        const {data: res} = await this.$http.get('goods', {params: this.queryInfo})
        res.data.goods = res.data.goods.filter(item => item.add_time = this.$moment(item.add_time).format('YYYY-MM-DD hh:mm:ss'))
        if(res.meta.status !== 200) return this.$message.error("获取商品列表失败！")
        this.$message.success("获取商品列表成功！")
        this.goodsList = res.data.goods
        this.total = res.data.total
      },
      // 根据商品名称搜索商品列表数据
      searchGoods(query) {
        this.queryInfo.query = query
        this.getGoodsList()
      },
      // 监听分页条数变化
      handleSizeChange(val) {
        this.queryInfo.pagesize = val
        this.getGoodsList()
      },
      // 监听分页页码变化
      handleCurrentChange(val) {
        this.queryInfo.pagenum = val
        this.getGoodsList()
      },
      // 清空搜索输入框时，重新调获取数据的方法
      cleatInput() {
        this.getGoodsList()
      },
      // 编辑商品信息
      editGoods(goodInfo) {
        this.editDialog = true
        let edit1 = JSON.stringify(goodInfo)
        this.goodInfo = JSON.parse(edit1)
      },
      // 删除商品
      delGoods(goods_id) {
        console.log(goods_id);
        this.$confirm('是否删除该商品?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data: res} = await this.$http.delete(`goods/${goods_id}`)
          if(res.meta.status !== 200) return this.$message.error("删除商品失败！")
          this.$message.success('删除成功!');
          this.getGoodsList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      // 跳转添加商品路由导航
      goAddPage() {
        this.$router.push('/goods/add')
      },
      handleClose() {
        this.editDialog = false
      },
      // 提交修改后的商品信息
      submitEditGoodInfo() {
        this.$refs.goodRef.validate(async valid => {
          if(valid) {
            this.goodInfo.pic = ""
            this.goodInfo.attrs = ""
            this.goodInfo.goods_introduce = ""
            console.log(this.goodInfo);
            const {data: res} = await this.$http.put(`goods/${this.goodInfo.goods_id}`, this.goodInfo)
            console.log(res);
            // if(res.meta.status !== 200) return this.$message.error("修改失败！")
            // this.$message.success("修改成功！")
            
            this.editDialog = false
          }
        })
      }
    }
  }
</script>

<style>

</style>