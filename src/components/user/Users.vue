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
                    <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="deleteEditDialog(scope.row.id)"></el-button>
                    <!-- 分配 -->
                    <el-tooltip effect="dark" content="分配角色" placement="bottom" :enterable="false">
                      <el-button type="warning" icon="el-icon-setting" size="mini" circle @click="setRole(scope.row)"></el-button>
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
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="addFrom.mobile"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改用户的对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
          <!-- 修改用户表单区域 -->
          <el-form :model="editForm" ref="editFormRef" :rules="editFormRules" label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="editForm.username" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
          </template>
        </el-dialog>
        <!-- 分配角色的对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClose">
          <div>
            <p>当前的用户: {{userInfo.username}}</p>
            <p>当前的角色: {{userInfo.role_name}}</p>
            <p>分配角色:
              <el-select v-model="selectedRoleId" placeholder="请选择">
                <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
                </el-option>
              </el-select>
            </p>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="setRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
          </span>
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
        mobile: ''
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
      },
      // 获取到修改用户前的数据
      editForm: {
      },
      // 表单校验规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色对话框隐藏
      setRoleDialogVisible: false,
      // 分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      roleList: [],
      // select已选中的ID
      selectedRoleId: ''
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
          console.log(this.addFrom)
          this.$message.success('添加用户成功!')
          this.addDialogVisible = false
          this.getUserList()
        })
    },
    // 展示修改用户卡片
    async showEditDialog (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
    },
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改表单
    editUserInfo () {
      this.$refs.editFormRef.validate(
        async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
          if (res.meta.status !== 200) {
            return this.$message.error('修改用户信息失败！')
          }
          // 关闭对话框
          this.editDialogVisible = false
          // 提示
          this.$message.success('修改用户成功！')
          // 刷新数据
          this.getUserList()
        })
    },
    async deleteEditDialog (id) {
      // 删除操作，弹出询问框
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => {
        return error
      })
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        this.getUserList()
      }
      this.deleteDialogVisible = false
      this.$message.success('已取消删除')
    },
    // 分配用户功能
    async setRole (userInfo) {
      this.userInfo = userInfo
      // 在打开对话框之前获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('请求角色列表失败')
      }
      this.roleList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo () {
      // 判断用户是否选择新角色
      if (!this.selectedRoleId) {
        return this.$message.error('请选择分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败！')
      }
      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 关闭对话框将分配角色选中的id清空
    setRoleDialogClose () {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
