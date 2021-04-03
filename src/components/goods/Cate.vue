<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
          <!-- 添加按钮 -->
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" index-text="序号" border :show-row-hover="false" class="tree-table" v-loading="loading">
          <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false"   style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.  cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 按钮操作列 -->
        <template slot="option" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini"  @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCateDialog(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
       <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" :pager-count="5">
    </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addCateDialogClose">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称: " prop="catName">
          <el-input v-model="addCateForm.catName"></el-input>
        </el-form-item>
        <el-form-item label="父级分类: ">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader v-model="selectKeys" :options="parentCateList" :props="casCaderProps" @change="parentCateChange" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 @close="editCateDialogClose" -->
    <el-dialog title="添加分类" :visible.sync="editDialogVisible" width="50%" >
      <el-form :model="editCateForm" :rules="editCateRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称: " prop="catName">
          <el-input v-model="editCateForm.catName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      // 数据分页总页数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列的模板名称
          template: 'option'
        }
      ],
      // 添加分类对话框的显示,不能为空，如果要添加1级分类，则父分类Id应该设置为  `0`
      addDialogVisible: false,
      // 懒加载表格
      loading: true,
      // 添加数据的表单
      addCateForm: {
        // 分类父亲的id
        catPid: 0,
        // 将要添加的分类名称
        catName: '',
        // 分类层级,不能为空，`0`表示一级分类；`1`表示二级分类；`2`表示三级分类
        catLevel: 0
      },
      // 添加表单的验证规则
      addCateRules: {
        catName: [
          { required: true, message: '请输入商品分类名称', trigger: 'blur' }
        ]
      },
      editCateRules: {
        catName: [
          { required: true, message: '请输入商品分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 添加分类的级联选择器的配置对象
      casCaderProps: {
        // 指定选项的值
        value: 'cat_id',
        // 指定选项标签
        label: 'cat_name',
        // 指定选项的子选项
        children: 'children',
        // 设置级联选择器打开方式
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 级联选项中的id数组
      selectKeys: [],
      // 修改分类的表单
      editCateForm: {
        editId: '',
        catName: ''
      },
      // 设置编辑分类对话框
      editDialogVisible: false
    }
  },
  created () {
    // 获取商品数据列表
    this.getCateList()
  },
  methods: {
    // 获取商品数据列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品数据失败!')
      }
      if (res) {
        this.loading = false
        // 赋值商品数据到列表
        this.cateList = res.data.result
        this.total = res.data.total
      }
    },
    // 监听pagesize变化,每页显示newsSize条数据
    handleSizeChange (newsSize) {
      this.queryInfo.pagesize = newsSize
      this.getCateList()
    },
    // 监听pagename变化,显示的页数
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 展示添加对话框
    showAddDialog () {
      // 获取父级分类列表
      this.getParentCateList()
      this.addDialogVisible = true
    },
    // 获取父级分类列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败!')
      }
      this.parentCateList = res.data
    },
    // 级联选择项发生变化触发这个时间
    parentCateChange () {
      // selectKeys为选中项的数据
      // 判断选中项长度如果不为零,说明有选中的父级选项
      // 父级分类就是你要选择的添加的分类
      if (this.selectKeys.length > 0) {
        // 当前父级分类的id
        this.addCateForm.catPid = this.selectKeys[this.selectKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.catLevel = this.selectKeys.length
        return ''
      } else {
        this.addCateForm.catPid = 0
        // 为当前分类的等级赋值
        this.addCateForm.catLevel = 0
      }
    },
    // 点击按钮添加新分类
    addCate () {
      // 直接点击确定按钮时进行预校验
      this.$refs.addCateFormRef.validate(
        async valid => {
          if (!valid) {
            return
          }
          const { data: res } = await this.$http.post('categories', { cat_pid: this.addCateForm.catPid, cat_name: this.addCateForm.catName, cat_level: this.addCateForm.catLevel })
          // 判断是返回值
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败!')
          }
          this.$message.success('添加成功')
          // 刷新列表
          this.getCateList()
          // 影藏对话框
          this.addDialogVisible = false
        }
      )
    },
    // 监听对话框关闭事件,重置表单
    addCateDialogClose () {
      this.$refs.addCateFormRef.resetFields()
      // 清空级联选项
      this.selectKeys = []
    },
    // 展示编辑分类对话框
    async showEditDialog (id) {
      // 根据id查询分类
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error('分类id查询失败')
      }
      // 获取点击的分类名
      this.editCateForm.catName = res.data.cat_name
      this.editCateForm.editId = id
      this.editDialogVisible = true
    },
    // 编辑分类
    async editCate () {
      const { data: res } = await this.$http.put(`categories/${this.editCateForm.editId}`, { cat_name: this.editCateForm.catName })
      if (res.meta.status !== 200) {
        this.$message.error('编辑分类失败!')
      }
      // 重新获取列表
      this.getCateList()
      this.$message.success('编辑分类成功')
      // 关闭对话框
      this.editDialogVisible = false
    },
    async deleteCateDialog (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete(`categories/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        this.getCateList()
      }
      this.deleteDialogVisible = false
      this.$message.success('已取消删除')
    }
  }
}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
