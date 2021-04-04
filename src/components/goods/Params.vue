<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 头部的警告区域 -->
    <el-card>
      <el-alert
      title="只允许选择三级页面"
      type="warning"
      show-icon
      :closable="false">
      </el-alert>
      <!-- 选择商品分类的区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtndisabled" @click="showAddDialogVisible">添加参数</el-button>
            <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
              <!-- 展开列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" :closable="true" @close="handeleClose(i, scope.row)">{{item}}</el-tag>
                  <!-- 添加tag的输入框 -->
                  <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtndisabled" @click="showAddDialogVisible">添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData"  border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" :closable="true" @close="handeleClose(i, scope.row)">{{item}}</el-tag>
                  <!-- 添加tag的输入框 -->
                  <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
            </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 数据分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        // 选中的值
        value: 'cat_id',
        // 获取到作为名称的数据
        label: 'cat_name',
        // 作为孩子节点的数据
        children: 'children',
        expandTrigger: 'hover'
      },
      // 数组双向绑定到级联选择框
      selectedCateKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态参数数据
      onlyTableData: [],
      // 设置对话框
      addDialogVisible: false,
      // 添加参数的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 添加属性表单内容
      addForm: {
        attr_name: ''
      },
      // 修改属性表单
      editForm: {
        attr_name: ''
      },
      // 控制编辑对话框
      editDialogVisible: false,
      // 修改表单验证对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制tag按钮和输入框的切换
      inputVisible: false,
      // tag文本框输入的内容
      inputValue: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据分类失败!')
      }
      this.catelist = res.data
    },
    // 级联选择框发送变化时触发的事件
    handleChange () {
      this.getParamsData()
    },
    // tab标签点击事件
    handleTabClick () {
      this.getParamsData()
      console.log(this.activeName)
    },
    // 点击级联三级选项,获取属性
    async getParamsData () {
      // 判断是否是三级页面
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return ''
      }
      // 证明选择的是三级分类
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据分类失败!')
      }
      // 判断获取到的数据是静态数据还是动态数据,如果是动态就渲染到动态,反之
      res.data.forEach(element => {
        // 判断是否是空字符串,不然会有空的tag标签
        element.attr_vals = element.attr_vals ? element.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        element.inputVisible = false
        // 文本框中输入的值
        element.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 点击添加按钮展示对话框
    showAddDialogVisible () {
      this.addDialogVisible = true
    },
    // 关闭对话框清空表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加对话框确定提交
    addParams () {
      this.$refs.addFormRef.validate(
        async valid => {
          if (!valid) {
            return ''
          }
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
          console.log(this.activeName)
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败！')
          }
          this.$message.success('添加成功')
        })
      this.getParamsData()
      this.addDialogVisible = false
    },
    // 点击编辑按钮展示对话框
    async showEditDialog (id) {
      // 查询当前的参数,数据回显
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败!')
      }
      this.editForm = res.data
      // 显示对话框
      this.editDialogVisible = true
    },
    // 编辑对话框关闭时触发重置
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定按钮修改参数
    editParams () {
      this.$refs.editFormRef.validate(
        async valid => {
          if (!valid) {
            return ''
          }
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
          if (res.meta.status !== 200) {
            return this.$message.error('获取参数信息失败!')
          }
          this.$message.success('修改参数成功')
          this.getParamsData()
          this.editDialogVisible = false
        }
      )
    },
    // 根据id删除对应的参数项
    async removeParams (attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(
        error => {
          return error
        }
      )
      console.log(confirmResult)
      // 判断是否点击确定
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      // 判断是否删除成功
      if (res.meta.status !== 200) {
        return this.$message.error('删除属性失败！')
      }
      this.$message.success('删除成功')
      this.getParamsData()
    },
    // 文本框按下enter或者失去焦点触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return ''
      }
      // 如果没有return，将数据push到数组中
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 将数据保存到数据库
      console.log(row)
      this.saveAttrVals(row)
    },
    // 将对row.attr_sel的操作保存到数据库
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        // 将属性数组转换为空格拼接
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        this.$message.error('数据修改失败！')
      }
      this.$message.success('修改数据成功')
    },
    // 点击按钮切换输入框
    showInput (row) {
      row.inputVisible = true
      // 自动获得焦点
      // $nextTick 当页面上内容被重新渲染后，执行回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除操作，数组中的值
    handeleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  // computed计算属性
  computed: {
    // 如果tab按钮需要禁用返回true
    isBtndisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算对话框标题
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}
.el-tag {
  margin-right: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>
