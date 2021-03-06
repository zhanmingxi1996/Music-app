<template>
  <scroll class="listview" 
          :data="data" 
          ref="listview"
          :listen-scroll="listenScroll"
          :probe-type="probeType"
          @scroll="scroll">
    <ul>
      <li v-for="(group, index) in data" class="list-group" :key="index" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul v-for="(item, index) in group.items" class="list-group-item" :key="index" @click="selectItem(item)">
          <img :src="item.avatar" class="avatar">
          <span class="name">{{item.name}}</span>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" 
        @touchstart.stop.prevent="onShortcutTouchStart"
        @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList" :key="index" :class="{item, current: currentIndex === index}" :data-index="index">{{item}}</li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import { getData } from 'common/js/dom'
  import Loading from 'base/loading/loading'

  const ANCHOR_HEIGHT = 18
  const TITLE_HEIGHT = 30

  export default {
    data() {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: -1
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
      this.touch = {}
      this.listHeight = []
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      shortcutList() {
        let shortcutArr = []
        this.data.forEach((item) => {
          shortcutArr.push(item.title.substr(0, 1))
        })
        return shortcutArr
      },
      fixedTitle () {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      selectItem(item) {
        this.$emit('select', item)
      },
      onShortcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex

        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta

        this._scrollTo(anchorIndex)
      },
      refresh () {
        this.$refs.listview.refresh()
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
      _calculateHeight () {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      },
      _scrollTo(index) {
        if (!index && index !== 0) {
          return
        }
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 300)
        this.scrollY = this.$refs.listview.scroll.y
      }
    },
    watch: {
      data () {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      scrollY (newY) {
        const listHeight = this.listHeight
        // 当滚动到顶部，newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      diff (newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
    },
    components: {
      Scroll,
      Loading
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
        background: rgb(249, 234, 234)
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
          right: 40px
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
      right: 3px
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 16px 0
      border-radius: 10px
      border: 1px solid #ccc
      text-align: center
      background: #eee
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          font-size: 12px
          font-weight: 800
          color: rgba(200, 50, 50, 0.8)
          border-radius: 9px
          border: 1px solid rgba(200, 50, 50, 0.8)
          background: #fff
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      z-index: 20
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 10px
        font-size: 15px
        color: #111
        background: rgb(249, 234, 234)
        border-left: 10px solid rgba(200, 50, 50, 0.8)
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
