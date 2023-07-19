<template>
  <div class="container">
    <!-- 面包屑导航区域 -->
    <Breadcrumb :menuData="menuData"></Breadcrumb>

    <el-card>
      <!-- 搜索 -->
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="cleatInput">
            <el-button slot="append" icon="el-icon-search" @click="searchOrder(queryInfo.query)"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表 -->
      <el-table :data="orderLists" border style="width: 100%; margin: 20px 0">
        <el-table-column type="index" label="#" width="60px"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号" > </el-table-column>
        <el-table-column prop="order_price" label="订单价格(元)"> </el-table-column>
        <el-table-column prop="order_pay" label="是否付款">
          <el-tag type="success" v-if="orderLists.order_pay === '1'">已付款</el-tag>
          <el-tag type="danger" v-else>未付款</el-tag>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间"> </el-table-column>
        <el-table-column label="操作" width="140px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editAddress(scope.row)"></el-button>
            <!-- <el-button size="mini" type="danger" icon="el-icon-delete" @click="searchSchedule(scope.row.goods_id)"></el-button> -->
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

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialog"
      width="40%">
      
      <el-form ref="addressFormRef" :model="addressForm" :rules="addressFormRules" label-width="120px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityOptions"
            :value="city"
            change-on-select
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialog = false">取 消</el-button>
        <el-button type="primary" @click="addressDialog = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查看物流信息 -->
    <el-dialog
      title="查看物流信息"
      :visible.sync="logisticsDialog"
      width="40%">
      <!-- 物流时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.timestamp">
          {{activity.content}}
        </el-timeline-item>
      </el-timeline>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="logisticsDialog = false">取 消</el-button>
        <el-button type="primary" @click="logisticsDialog = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import Breadcrumb from '../../components/Breadcrumb'
  import cityOptions from './city'
  export default {
    name: 'Orders',
    components: { Breadcrumb },
    data() {
      return {
        menuData: ['订单管理', '订单列表'],
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 8
        },
        orderLists: [],
        total: 0,
        addressDialog: false,      // 地址对话框
        logisticsDialog: false,    // 物流对话框
        cityOptions: cityOptions,
        addressForm: {
          address1: [],
          address2: ''
        },
        addressFormRules: {
          address1: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
          address2: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
        },
        activities: [{             // 物流时间线数据
          content: '活动按期开始',
          timestamp: '2018-04-15'
        }, {
          content: '通过审核',
          timestamp: '2018-04-13'
        }, {
          content: '创建成功',
          timestamp: '2018-04-11'
        }],
        city: ''
      }
    },
    created() {
      this.getOrdersList()
    },
    methods: {
      // 获取订单列表
      async getOrdersList() {
        const {data: res} = await this.$http.get('orders', {params: this.queryInfo})
        res.data.goods = res.data.goods.filter(item => item.create_time = this.$moment(item.create_time).format('YYYY-MM-DD hh:mm:ss'))
        if(res.meta.status !== 200) return this.$message.error("获取商品列表失败！")
        this.$message.success("获取商品列表成功！")
        this.orderLists = res.data.goods
        this.total = res.data.total
      },
      // 查询订单
      searchOrder(query) {
        this.queryInfo.query = query
        this.getOrdersList()
      },
      // 编辑物流地址
      editAddress() {
        this.addressDialog = true
      },
      // 查看物流进度
      // async searchSchedule(id) {
      //   console.log(id);
      //   this.logisticsDialog = true
        
      // },
      // 清空搜索
      cleatInput() {
        this.getOrdersList()
      },
      // 监听分页条数变化
      handleSizeChange(val) {
        this.queryInfo.pagesize = val
        this.getOrdersList()
      },
      // 监听分页页码变化
      handleCurrentChange(val) {
        this.queryInfo.pagenum = val
        this.getOrdersList()
      },
    },
  }
</script>

<style scoped>
  .el-cascader {
    width: 100%;
  }
</style>