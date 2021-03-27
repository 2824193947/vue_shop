<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card class="box-card">
            <!-- 搜索与添加区域 -->
            <el-row :gutter="30">
                <el-col :span="9">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <template #append>
                          <!-- 此处搜索用户利用数据绑定搜索数据的参数query,调用查询用户的函数 -->
                            <el-button solt="append" icon="el-icon-search" @click="getUserList"></el-button>
                        </template>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区域 -->
            <el-table :data="userlist" border stripe style="width: 100%">
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                  <template slot-scope="scope">
                    <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
                    </el-switch>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                  <template slot-scope="scope">
                    <!-- 修改 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="showEditDialog(scope.row.id)"></el-button>
                    <!-- 删除 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" circle></el-button>
                    <!-- 分配 -->
                    <el-tooltip effect="dark" content="Bottom Center 提示文字" placement="bottom" :enterable="false">
                      <el-button type="warning" icon="el-icon-setting" size="mini" circle></el-button>
                    </el-tooltip>
                  </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 3, 5]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户的对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
          <!-- 内容主题区域 -->
          <el-form :model="addFrom" ref="addFormRef" :rules="addFormRules" label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addFrom.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="addFrom.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addFrom.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="moblie">
              <el-input v-model="addFrom.moblie"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改用户的对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" >
          <span>这是一段信息</span>
          <template #footer>
            <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
            </span>
          </template>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rules, value, cb) => {
      const regEmail = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法邮箱'))
    }
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 用户列表参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户数据列表
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示隐藏
      editDialogVisible: false,
      dialogVisible: false,
      // 添加表单的数据
      addFrom: {
        username: '',
        password: '',
        email: '',
        moblie: ''
      },
      // 添加表单验证数据
      addFormRules: {
        username: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3 到 10 个字符', trigger: 'blur' }
        ],
        moblie: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
    // 获取用户数据列表
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('用户列表获取失败!')
      }
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听swich改变
    async userStateChange (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      console.log(res)
      if (res.meta.status !== 200) {
        // 如果修改失败将修改的记录取消掉
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('修改状态失败!')
      }
      this.$message.success('更新状态成功!')
    },
    // 监听pagesize改变,每页条数
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    // 监听页码值
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    // 关闭添加对话框触发
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    addUser () {
      this.$refs.addFormRef.validate(
        async valid => {
          if (!valid) return
          // 校验成功返回true
          const { data: res } = await this.$http.post('users', this.addFrom)
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败!')
          }
          this.$message.success('添加用户成功!')
          this.dialogVisible = false
          this.getUserList()
        })
    },
    // 展示修改用户卡片
    async showEditDialog (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      console.log(res)
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
