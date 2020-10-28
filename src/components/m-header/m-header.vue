<template>
  <div class="m-header border-1px">
    <h1 class="text">Max Music</h1>
    <router-link tag="div" class="mine" to="/user">
      <i class="icon-mine"></i>
    </router-link>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .m-header
    position: relative
    height: 44px
    text-align: center
    color: $color-theme
    font-size: 0
    background-image: url(heard-bg.png)
    border-1px(rgba(7, 17, 27, 0.2))
    .text
      display: inline-block
      vertical-align: top
      line-height: 44px
      font-size: $font-size-large
    .mine
      position: absolute
      top: -1px
      right: 4px
      .icon-mine
        display: block
        padding: 12px
        font-size: 22px
        color: $color-theme
</style>
