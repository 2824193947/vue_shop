<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addrole">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
          <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row :class="['bdbottom', l1 === 0 ? 'bdtop' : '' ,'vcenter']" v-for="(item1, l1) in scope.row.children" :key="item1.id">
                  <!-- 渲染一级权限 -->
                  <el-col :span="5">
                      <el-tag  closable @close="removeRightbyid(scope.row, item1.id)">{{item1.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染二级和三级权限 -->
                  <el-col :span="19">
                    <!-- 用for循环渲染二级权限 -->
                    <el-row :class="l2 === 0 ? '' : 'bdtop'" v-for="(item2, l2) in item1.children" :key="item2.id" class="vcenter">
                      <el-col :span="6">
                        <el-tag type="success"  closable @close="removeRightbyid(scope.row, item2.id)">{{item2.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      <!-- 三级权限 -->
                      <el-col :span="18">
                        <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightbyid(scope.row, item3.id)">{{item3.authName}}</el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </template>
          </el-table-column>
          <!-- 索引列 -->
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRloesDialog(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete"  @click="deleteRloesDialog(scope.row.id)">删除</el-button>
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="提示" :visible.sync="setRightDialog" width="50%" @close="setRightDialogClose">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true"  :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogFormRole" @close="addDialogClose">
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addFormRef">
        <el-form-item label="角色名称" label-width="90px" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="90px" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogFormRole = false">取 消</el-button>
        <el-button type="primary" @click="AddRoles">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog :model="editList" title="修改角色" :visible.sync="editDialogFormRole">
      <el-form>
        <el-form-item label="角色名称" label-width="90px">
          <el-input v-model="editList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="90px">
          <el-input v-model="editList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogFormRole = false">取 消</el-button>
          <el-button type="primary" @click="editRightsRoles">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色的列表
      roleList: [],
      // 控制分配权限布尔值
      setRightDialog: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的绑定属性
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 即将分配权限的角色
      roleId: '',
      // 控制添加角色对话框
      addDialogFormRole: false,
      // 添加角色表单数据
      addRoleForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // 添加角色验证规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ]
      },
      // 修改角色对话框显示
      editDialogFormRole: false,
      // 要修改用户的id
      editRole: '',
      // 需要修改用户的数据
      editList: {}
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取所有角色
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('查询角色失败')
      }
      this.roleList = res.data
    },
    // 根据id删除对应权限
    async removeRightbyid (roleId, rightId) {
      // 弹框提示是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(`roles/${roleId.id}/rights/${rightId}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('用户列表获取失败!')
      }
      // this.getRoleList()
      roleId.children = res.data
    },
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('查询所有权限失败')
      }
      // 获取到的数据保存到data中
      this.rightsList = res.data
      // 递归获取单机id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialog = true
    },
    // 递归获取角色的三级权限,保存到defKeys
    getLeafKeys (node, arr) {
      // 判断没有children属性,就是三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(
        item => {
          this.getLeafKeys(item, arr)
        })
    },
    // 监听分配权限的对话框关闭,关闭将数组置空不然tree中的选中的id一直会递增
    setRightDialogClose () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      // ...是展开运算符
      // keys:选中的id
      const keys = [
        // 全不选中状态的id
        ...this.$refs.treeRef.getCheckedKeys(),
        // 半选中的id,例如父亲里的孩子没有全选
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 将数组换为,号隔开的字符串
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRoleList()
      this.setRightDialog = false
    },
    addrole () {
      this.addDialogFormRole = true
    },
    async AddRoles () {
      this.$refs.addFormRef.validate(
        async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('roles', { roleName: this.addRoleForm.roleName, roleDesc: this.addRoleForm.roleDesc })
          if (res.meta.status !== 201) {
            return this.$message.error('添加角色失败 !')
          }
          this.$message.success('添加角色成功')
          this.getRoleList()
          this.addDialogFormRole = false
        })
    },
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    async editRloesDialog (role) {
      // 获取点击修改的角色id
      this.editRole = role.id
      // 查询点击角色信息
      const { data: res } = await this.$http.get('roles/' + role.id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      // 将已经有的数据添加到修改的表单对象
      this.editList = res.data
      this.editDialogFormRole = true
    },
    async editRightsRoles () {
      const { data: res } = await this.$http.put(`roles/${this.editRole}`, { roleName: this.editList.roleName, roleDesc: this.editList.roleDesc })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('修改角色失败!')
      }
      this.$message.success('修改角色成功')
      this.getRoleList()
      this.editDialogFormRole = false
    },
    // 删除角色
    async deleteRloesDialog (id) {
      // 显示确认删除弹框
      const deleterights = await this.$confirm('此操作将永久删除该文件, 是否续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      // 取消删除
      if (deleterights !== 'confirm') {
        return this.$message.info('取消删除')
      }
      // 发起删除请求
      const { data: res } = await this.$http.delete(`roles/${id}`)
      // 判断删除成功?
      if (res.meta.status !== 200) {
        return this.$message.error('删除角失败  !')
      }
      this.$message.success('删除角色成功')
      // 刷新列表
      this.getRoleList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>
