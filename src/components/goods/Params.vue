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
              <el-table-column type="expand"></el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
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
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
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
        <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
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
      }

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
    async getParamsData () {
      // 判断是否是三级页面
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return ''
      }
      // 证明选择的是三级分类
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据分类失败!')
      }
      // 判断获取到的数据是静态数据还是动态数据,如果是动态就渲染到动态,反之
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
      console.log(res.data)
    },
    showAddDialogVisible () {
      this.addDialogVisible = true
    },
    // 关闭对话框清空表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
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
</style>
