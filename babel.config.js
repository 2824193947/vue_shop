// 这是项目开发阶段用到的bable插件
const prodPlugins = []
// 判断编译时--model的值是否是production,如果是就是发布阶段,反之开发阶段
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布产品时的插件数组
    ...prodPlugins
  ]
}
