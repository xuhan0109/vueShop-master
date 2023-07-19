<template>
  <div class="container">
    <!-- 面包屑导航区域 -->
    <Breadcrumb :menuData="menuData"></Breadcrumb>

    <el-card>
      <div id="reports" style="width: 100%;height: 500px;"></div>
    </el-card>
  </div>
</template>

<script>
  import Breadcrumb from '../../components/Breadcrumb'
  import * as echarts from 'echarts';
  import _ from 'lodash'
  export default {
    name: 'Reports',
    components: { Breadcrumb },
    data() {
      return {
        menuData: ['数据统计','数据报表'],
        options: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }
      }
    },
    mounted() {
      this.getReportsData()
    },
    methods: {
      // 获取报表数据
      async getReportsData() {
        const {data: res} = await this.$http.get('reports/type/1')
        if(res.meta.status !== 200) return this.$message.error("获取报表失败！")
        this.$message.success("获取报表成功！")
        console.log(res);
        var myChart = echarts.init(document.getElementById('reports'));
        const results = _.merge(res.data, this.options)
        myChart.setOption(results);
      }
    },
  }
</script>

<style>

</style>