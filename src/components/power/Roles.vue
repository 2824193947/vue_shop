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
          <el-button type="primary">添加角色</el-button>
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
            <template>
              <!-- slot-scope="scope" -->
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              <el-button size="mini" type="warning" icon="el-icon-setting">编辑权限</el-button>
            </template>
          </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色的列表
      roleList: []
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
