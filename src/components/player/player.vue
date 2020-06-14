<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd">
                <img class="image" :src="currentSong.image" :class="cdCls">
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="progress-wrapper">
            <span class="time time-l">{{currentTime}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar ref="progressBar" :percent="percent"
                            @percentChange="onProgressBarChange"
                            @percentChanging="onProgressBarChanging">
              </progress-bar>
            </div>
            <span class="time time-r">{{songDuration}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i class="icon-sequence"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" 
                 @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper" ref="miniWrapper">
            <img ref="miniImage" :class="cdCls" width="40" height="40" :src="currentSong.image">
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" 
            :src="currentSong.url" 
            @canplay="ready" 
            @error="error"
            @timeupdate="updateTime">
    </audio>
  </div>
</template>


<script type="text/ecmascript-6">
  import {mapGetters, mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import { prefixStyle } from 'common/js/dom'
  import Velocity from "velocity-animate"
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'

  const transform = prefixStyle('transform')

  export default {
    data() {
      return {
        songReady: false,
        currentTime: 0,
        radius: 44,
        songDuration: 0,
        percent: 0
      }
    },
    computed: {
      playIcon () {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon () {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      disableCls () {
        return this.songReady ? '' : 'disable'
      },
      ...mapGetters([
        'currentIndex',
        'fullScreen',
        'playing',
        'playlist',
        'currentSong'
      ])
    },
    watch: {
      currentTime() {
        this.percent = this.$refs.audio.currentTime / this.currentSong.duration
      },
      currentSong() {
        this.$nextTick(() => {
          this._getSongDuration()
          this.$refs.audio.play()
        })
      },
      playing(newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying? audio.play() : audio.pause()
        })
      }
    },
    methods: {
      onProgressBarChange(percent) {
        // 根据百分比，计算出要修改到的播放时间
        const currentTime = this.currentSong.duration * percent
        // 设置播放时间，在这里真正地改变了歌曲进度
        this.$refs.audio.currentTime = currentTime
        // 修改进度条左边的时间显示
        this.currentTime = currentTime
        // 即使歌曲正在暂停，也会切换到指定进度开始播放
        if (!this.playing) {
          this.togglePlaying()
        }
      },
      onProgressBarChanging(percent) {
        let time = this.currentSong.duration * percent
        time = time | 0
        let minute = time / 60 | 0
        let second = 0
        let len = (time % 60).toString().length
        if (len < 2) {
          second = '0' + (time % 60)
        } else {
          second = (time % 60).toString()
        }
        this.currentTime = `${minute}:${second}`
      },
      _getSongDuration() {
        let time = this.currentSong.duration
        time = time | 0
        let minute = time / 60 | 0
        let second = 0
        let len = (time % 60).toString().length
        if (len < 2) {
          second = '0' + (time % 60)
        } else {
          second = (time % 60).toString()
        }
        this.songDuration = `${minute}:${second}`
      },
      updateTime() { // 获取当前播放到的时间，赋值给data中的currentTime
        let time = this.$refs.audio.currentTime
        time = time | 0 // 向下取整的技巧性写法
        let minute = time / 60 | 0 // 获取分钟数
        // 下面获取秒数，因为秒数为个位数时，要在前面加0
        let second = 0
        let len = (time % 60).toString().length
        if (len < 2) {
          second = '0' + (time % 60) // 利用字符串和数字相加，自动转换类型
        } else {
          second = (time % 60).toString()
        }
        this.currentTime = `${minute}:${second}`
      },
      back() { // 控制播放器收起
        this.setFullScreen(false)
      },
      open() { // 控制播放器全面打开
        this.setFullScreen(true)
      },
      next() {
        if (!this.songReady) {
          return
        } // 歌曲还没有准备好的时候，就return掉
        let index = this.currentIndex + 1
        if (index === this.playlist.length) { // 当是最后一首歌的时候
          index = 0 // 从播放列表第一首，重新开始
        }
        this.setCurrentIndex(index) // setCurrentIndex使用mutation提交
        if (!this.playing) { // 如果播放状态是暂停，我们就切换播放状态
          this.togglePlaying()
        }
        this.songReady = false // 执行完点击，将标志位置为false
      },
      prev() {
        if (!this.songReady) {
          return
        } // 歌曲还没有准备好的时候，就return掉
        let index = this.currentIndex - 1
        if (index === -1) { // 当是第一首的时候
          index = this.playlist.length - 1 // 播放最后一首,记得减一
        }
        this.setCurrentIndex(index)
        if (!this.playing) { // 如果播放状态是暂停，我们就切换播放状态
          this.togglePlaying()
        }
        this.songReady = false
      },
      ready() { // 歌曲准备完毕，将标志位置为true
        this.songReady = true
      },
      error () {
        this.songReady = true
      },
      enter (el, done) {
        const { x, y, scale } = this._getPosAndScale()

        Velocity(this.$refs.cdWrapper,{
          translateX: `${x}px`, // 注意这里的写法“translateX”，是特殊的
          translateY: `${y}px`, // 这里写“translate3d是不行的，根本没效果
          scale: `${scale}`
        },{
          duration: 0, // 这里写0，是动画的起始位置
          easing: "linear"
        }) // 本来动画起始位置是要在beforeEnter钩子规定的，但是这样也可以

        Velocity(this.$refs.cdWrapper,{
          translateX: "0px",
          translateY: "0px",
          scale: "1.1"
        },{
          duration: 240,
          easing: "linear",
        })

        Velocity(this.$refs.cdWrapper,{
          translateX: "0px",
          translateY: "0px",
          scale: "1"
        },{
          duration: 160,
          easing: "linear",
          complete: () => {
            done() // 记得在动画的最后调用done回调，才会进入下一个钩子函数
          }
        })
      },
      afterEnter () {
        this.$refs.cdWrapper.style.animation = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      leave (el, done) {
        const { x, y, scale } = this._getPosAndScale()
        
        Velocity(this.$refs.cdWrapper, {
          translateX: `${x}px`,
          translateY: `${y}px`,
          scale: `${scale}`
        },
        {
          duration: 400,
          easing: "linear",
          complete: done
        })
      },
      afterLeave () {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      _getPosAndScale () {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      togglePlaying() {
        this.setPlayingState(!this.playing)
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX'
      })
    },
    components: {
      ProgressBar,
      ProgressCircle
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
                &.play
                  animation: rotate 20s linear infinite
                &.pause
                  animation-play-state: paused
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: rgba(226,156,156,0.9)
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          position: relative
          bottom: 2px
          height: 100%
          width: 100%
          border-bottom: 3px solid red
          border-radius: 50%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: #fff
        .desc
          no-wrap()
          font-size: $font-size-small
          color: #fff
      .control
        flex: 0 0 36px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: #f9eaea
        .icon-mini
          font-size: 32px
          position: absolute
          right: -2px
          top: 6px

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>