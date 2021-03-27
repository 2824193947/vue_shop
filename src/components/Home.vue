<template>
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div>
          <img src="../assets/resizeApi.png" alt="logo">
          <h4>电商后台管理系统</h4>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 页面主题区域 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="iscollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- el-menu的属性看element官网  collapse展开菜单 collapse-transition展开菜单动画  router开启路由模式index就是路由地址-->
          <el-menu :uniqueOpened="true" background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened="true" :collapse="iscollapse" :collapse-transition="false" :router="true" :default-active="activePath">
            <!-- 一级菜单 -->
            <!-- 这里的index熟悉规定不可以使用插值方法,需要使用数据绑定,并且只接受字符串,所以item.id转化为字符串 -->
            <el-submenu :index="item.id + '' " v-for="item in menulist" :key="item.id">
              <!-- 一级菜单模板区域 -->
              <template #title>
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/' + subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="saveNavState('/' + subitem.path)">
                  <template #title>
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 文本 -->
                  <span>{{subitem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 侧内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      // 菜单图标数据
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠
      iscollapse: false,
      // 菜单中被激活连接的地址
      activePath: '',
      pathname: ''
    }
  },
  created () {
    this.getMenuList()
    // 侧边栏高亮提示
    this.activePath = window.sessionStorage.getItem('activePath')
    // 获取地址的请求参数,刷新时让侧边栏高亮
    this.activePath = window.location.hash.substring(1)
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // console.log(res)
    },
    // 点击按钮切换菜单折叠
    toggleCollapse () {
      this.iscollapse = !this.iscollapse
    },
    // 保存连接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  div {
    display: flex;
    height: 44px;
    width: 250px;
    img {
      height: 40px;
      width: 40px;
    }
    h4 {
      line-height: 1px;
      margin-left: 17px;
      color: #fff;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4A5064;
  line-height: 24px;
  font-size: 10px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.1em;
  cursor: pointer;
}
</style>
