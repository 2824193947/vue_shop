module.exports = {
  chainWebpack: config => {
    // (发布模式)查找并使用的是cdn资源
    config.when(process.env.NODE_ENV === 'production', config => {
        // 入口函数(使用不同的入口函数不会互相影响)
        config.entry('app').clear().add('./src/main-prod.js')
        // 查找全局的插件,就是index.html里全局导入的包
        config.set('externals', {
            vue: 'Vue',
            'vue-router': 'VueRouter',
            axios: 'axios',
            loadsh: '_',
            echarts: 'echarts',
            nprogress: 'NProgress',
            'vue-quill-editor': 'VueQuillEditor'
        })
        // 添加一个值用来帕努单html文件中是否引入资源
        config.plugin('html').tap(args => {
            // 给args[0]追加一个值
            args[0].isProd = true
            return args
        })
    })
    // process.env.NODE_ENV固定写法拿到当前执行模式(开发模式)
    config.when(process.env.NODE_ENV === 'development', config => {
        // 入口函数(使用不同的入口函数不会互相影响)
        config.entry('app').clear().add('./src/main-dev.js')
        config.plugin('html').tap(args => {
            // 给args[0]追加一个值
            args[0].isProd = false
            return args
        })
    })
  }
}