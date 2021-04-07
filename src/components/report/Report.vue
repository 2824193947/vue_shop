<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- echars第二步 -->
            <div id="main" style="width: 750px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
// echars第一步
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  data () {
    return {
      // 服务器数据功能不全面,需要合并的数据  
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
  created () {
  },
  // dom初始化后执行 
  async mounted () {
    // echars第三步
    var myChart = echarts.init(document.getElementById('main'))
    const { data:res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      this.$message.error('获取折现图数据列表失败!')
    }
    console.log(res.data)
    // echars第四步
    // loadsh有一个合并对象的函数
   const result =  _.merge(res.data, this.options)
    // 展示数据
    myChart.setOption(result)
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
</style>
