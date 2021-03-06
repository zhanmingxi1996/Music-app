<template>
  <scroll :pullup="pullup"
          @scrollToEnd="searchMore"
          :data="result" 
          class="suggest"
          ref="suggest"
          :beforeScroll="beforeScroll"
          @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="(item, index) in result" :key="index">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果!"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import { search } from 'api/search'
  import { ERR_OK } from 'api/config'
  import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
  import Scroll from 'base/scroll/scroll.vue'
  import Loading from 'base/loading/loading'
  import NoResult from 'base/no-result/no-result'
  import Singer from 'common/js/singer'
  import { mapMutations, mapActions } from 'vuex'

  const TYPE_SINGER = 'singer'
  const perpage = 20

  export default {
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        page: 1,
        result: [],
        pullup: true,
        hasMore: true,
        beforeScroll: true
      }
    },
    watch: {
      query (newQuery) {
        if (!newQuery) {
          return
        }
        this.search(newQuery)
      }
    },
    methods: {
      listScroll () {
        this.$emit('listScroll')
      },
      selectItem (item) {
        // 如果点击的是歌手
        if (item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          // 带路由参数的跳转，跳转到歌手歌曲列表
          this.$router.push({
            path: `/search/${singer.id}`
          })
          // 然后通过mutation设置vuex中的singer
          this.setSinger(singer)
        } else {
          // 如果点击的是歌曲，那么触发insertSong的action
          // 这个action会触发“插入歌曲”，以及“播放插入歌曲”
          // 触发“播放插入歌曲”，是因为该action改变了currentSong
          this.insertSong(item)
        }
        this.$emit('select', item)
      },
      refresh () {
        this.$refs.suggest.refresh()
      },
      searchMore() {
        if (!this.hasMore) {
          return
        }
        this.page++
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this._getResult(res.data).then((result) => {
              this.result = this.result.concat(result)
            })
            this._checkMore(res.data)
          }
        })
      },
      search() {
        this.page = 1
        this.hasMore = true
        this.$refs.suggest.scrollTo(0, 0)
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if(res.code === ERR_OK) {
            this._getResult(res.data).then((result) => {
              this.result = result
            })
            this._checkMore(res.data)
          }
        })
      },
      _getResult(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid && this.page === 1) {
          ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } })
        }
        return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
          ret = ret.concat(songs)
          return ret
        })
      },
      _normalizeSongs (list) {
        let ret = []
        list.forEach((musicData) => {
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      getIconCls (item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      getDisplayName (item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      _checkMore (data) {
        const song = data.song
        if (!song.list.length || (song.curnum + (song.curpage - 1) * perpage) >= song.totalnum) {
          this.hasMore = false
        }
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    components: {
      Scroll,
      Loading,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: rgba(0,0,0,0.5)
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
