<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片 -->
        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单列表 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | datEFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                        <el-button type="primary" class="el-icon-edit" size="mini" @click="showBox"></el-button>
                        <el-button type="success" class="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                </el-table-column>
            </el-table>
            <!-- 分页功能 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[10, 15, 30, 40]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>
        <!-- 修改地址对话框 -->
        <el-dialog
        title="提示"
        :visible.sync="editDialogVisible"
        width="50%" @close="DialogClosed">
          <el-form :model="addressForm" :rules="addressRules" ref="addressRef" label-width="100px">
          <el-form-item label="省事区/县" prop="address1">
            <el-cascader
            :options="cityData" v-model="addressForm.address1"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
          </span>
        </el-dialog>
        <el-dialog
        title="物流进度"
        :visible.sync="progressDialogVisible"
        width="50%">
          <!-- 时间线 -->
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in progressInfo"
              :key="index"
              :timestamp="activity.time">
              {{activity.context}}
            </el-timeline-item>
          </el-timeline>
          <span slot="footer" class="dialog-footer">
            <el-button @click="progressDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总页数
      total: 0,
      // 数据列表
      orderlist: [],
      // 隐藏对话框
      editDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      cityData: cityData,
      progressDialogVisible: false,
      // 物流信息
      progressInfo: [
        {
          time: '2019-03-19 13:07:40',
          ftime: '2019-03-19 13:07:40',
          context: '快件已签收 签收人: 家人 感谢使用圆通速递，期待再次为您服务',
          location: null
        },
        {
          time: '2019-03-19 07:49:12',
          ftime: '2019-03-19 07:49:12',
          context: '北京市顺义区顺义机场公司派件人: 侯国宝（155****5526） 正在派件',
          location: null
        },
        {
          time: '2019-03-19 06:38:38',
          ftime: '2019-03-19 06:38:38',
          context: '快件已到达 北京市顺义区顺义机场公司',
          location: null
        },
        {
          time: '2019-03-18 21:45:46',
          ftime: '2019-03-18 21:45:46',
          context: '快件已发往 北京市顺义区顺义机场公司',
          location: null
        },
        {
          time: '2019-03-18 19:32:10',
          ftime: '2019-03-18 19:32:10',
          context: '快件已到达 北京转运中心',
          location: null
        },
        {
          time: '2019-03-18 00:21:50',
          ftime: '2019-03-18 00:21:50',
          context: '快件已发往 北京转运中心',
          location: null
        },
        {
          time: '2019-03-17 21:25:35',
          ftime: '2019-03-17 21:25:35',
          context: '快件已到达 淮安转运中心',
          location: null
        },
        {
          time: '2019-03-17 19:16:06',
          ftime: '2019-03-17 19:16:06',
          context: '快件已发往 江苏省宿迁市沭阳县公司',
          location: null
        },
        {
          time: '2019-03-17 19:04:21',
          ftime: '2019-03-17 19:04:21',
          context: '江苏省宿迁市沭阳县公司取件人: 李红雨（15751571351） 已收件',
          location: null
        }
      ]
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败!')
      }
      console.log(res)
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newpage) {
      this.queryInfo.pagenum = newpage
      this.getOrderList()
    },
    // 修改地址对话框
    showBox () {
      this.editDialogVisible = true
    },
    DialogClosed () {
      this.$refs.addressRef.resetFields()
    },
    async showProgressBox () {
      const { data: res } = await this.$http.get('/kuaidi100/YT9502028084525').catch(error => {
        return error
      })
      console.log(res)
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流信息失败!')
      // }
      // this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
