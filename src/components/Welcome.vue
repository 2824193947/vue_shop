<template>
    <h2 :v-model="date" class="h3">欢迎进入电商管理系统,登录时间<span class="span">{{date | datEFormat}}</span></h2>
</template>

<script>
export default {
  data () {
    return {
      date: ''
    }
  },
  created () {
    var timestamp1 = Date.parse(new Date())
    this.date = timestamp1
  }
}
</script>

<style>
  .h3 {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-280px,-100px);
    display: block;
  }
  .span{
    display: inline-block;
    margin-left: 20px;
  }
</style>
