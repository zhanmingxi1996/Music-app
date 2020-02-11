<template>
  <scroll class="listview" :data="data">
    <ul>
      <li v-for="(group, index) in data" class="list-group" :key="index">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul v-for="(item, index) in group.items" class="list-group-item" :key="index">
          <img :src="item.avatar" class="avatar">
          <span class="name">{{item.name}}</span>
        </ul>
      </li>
    </ul>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'

  export default {
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    components: {
      Scroll
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 10px
        font-size: 15px
        color: #111
        background: #fff
        border-left: 10px solid rgba(200, 50, 50, 0.8)
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        position: relative
        &:after
          display: block
          position: absolute
          left: 80px
          right: 30px
          bottom: 10px
          border-top: 1px solid rgba(7, 17, 27, 0.3)
          content: ' '
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: #888
          font-size: 14px
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
