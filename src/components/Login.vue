<template>
    <div class="login_container">
        <div class="login_box">
          <!-- 头像区域 -->
          <div class="avatar_box">
            <img src="../assets/logo.png" alt="">
          </div>
        <!-- 登录表单区域 -->
          <el-form ref="loginFromRef" :model="loginFrom" :rules="loginFromRules" class="login_form">
            <!-- 用户名 -->
            <el-form-item prop="username">
              <el-input v-model="loginFrom.username" prefix-icon="iconfont icon-user"></el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item prop="password">
              <el-input v-model="loginFrom.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
            </el-form-item>
            <!-- 按钮区域 -->
            <el-form-item class="btns">
              <el-button type="primary" @click="login">登录</el-button>
              <el-button type="info" @click="resetLoginForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录表单的数据绑定对象
      loginFrom: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则对象
      loginFromRules: {
        // 验证用户名合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置
    resetLoginForm () {
      this.$refs.loginFromRef.resetFields()
    },
    // 登录
    login () {
      this.$refs.loginFromRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return
        const result = await this.$http.post('login', this.loginFrom)
        console.log(result)
        if (result.data.meta.status !== 200) {
          return this.$message.error('登录失败！')
        }
        this.$message.success('登录成功')
        // 1.将登录之后的token，保存到客户端的sessionstorage中
        // 1.1项目中出现了登录之外的其他api接口，必须在登录之后才能访问
        // 1.2token 只应在当前网站打开区间生效
        console.log(result.data)
        window.sessionStorage.setItem('token', result.data.data.token)
        // 2.通过编程导航跳转到后台主页，路由地址是 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container{
  background-color: #2b4b6b;
  height: 100%;
}
.login_box{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  .avatar_box{
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    width: 130px;
    height: 130px;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 10px #ddd;
    img{
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login_form{
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
