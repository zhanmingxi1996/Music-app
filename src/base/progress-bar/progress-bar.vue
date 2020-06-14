<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import { prefixStyle } from 'common/js/dom'

  const progressBtnWidth = 16
  const transform = prefixStyle('transform')

  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      this.touch = {}
    },
    watch: {
      percent(newVal) {
        this.setProgressOffset(newVal)
      }
    },
    methods: {
      progressTouchStart(e) {
        // 设置一个“触摸开始”的标志位
        this.touch.initiated = true
        // 这里是第一次点击到屏幕的时候的 X 轴位置
        this.touch.startX = e.touches[0].pageX
        // 这里是“已经走过的进度条”的长度，用来之后计算“move”的距离
        this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove(e) {
        if (!this.touch.initiated) {
          return
        } // 也就是说，如果我们没有见过start就到了move的话，就return掉
        // 计算当前移动到的位置，距离第一个触摸点的位置, x 轴偏移量
        const deltaX = e.touches[0].pageX - this.touch.startX
        // 处理拖动 超过 进度条长度的情况，和往回拖动 超过 起点的情况
        // 将拖动产生的move距离，限制在进度条的范围内
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
        // 有了偏移距离，下面就根据偏移量设置button的样式，使偏移
        this._offset(offsetWidth)

        this.$emit('percentChanging', this._getPercent())
      },
      progressTouchEnd(e) {
        this.touch.initiated = false
        this._triggerPercent()
      },
      progressClick(e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
        // this._offset(e.offsetX)
        this._triggerPercent()
      },
      _offset (offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      },
      setProgressOffset (percent) {
        if (percent >= 0 && !this.touch.initiated) {
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          const offsetWidth = percent * barWidth
          this._offset(offsetWidth)
        }
      },
      _getPercent () {
        // 计算进度条总长度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        return this.$refs.progress.clientWidth / barWidth
      },
      _triggerPercent () {
        this.$emit('percentChange', this._getPercent())
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(255, 255, 255, 0.4)
      border: 1px solid rgba(7, 17, 27, 0.1)
      border-radius: 2px
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid rgba(255, 255, 255, 0.9)
          border-radius: 50%
          background: $color-theme
</style>
