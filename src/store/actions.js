import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import { saveSearch, clearSearch, deleteSearch, savePlay, saveFavorite, deleteFavorite } from 'common/js/cache'

function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

export const selectPlay = function ({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list) // 打乱原本的顺序播放歌曲列表，成随机列表
    commit(types.SET_PLAYLIST, randomList) // 找到当前歌曲在随机列表中的位置
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({ commit, state }, song) {
  let playlist = state.playlist.slice()
  // 因为不能直接改变state的状态，所以，我们需要一个复制的歌曲列表
  let sequenceList = state.sequenceList.slice()
  // 和上面同理，一个复制的顺序播放列表
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有待插入的歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲，所以索引+1
  // 这里索引+1，不不代表歌曲列表长度必定加1，而是位置上的+1
  currentIndex++
  // 插入这首歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // 如果已经包含了这首歌
  if (fpIndex > -1) {
    // 如果当前插入的序号大于列表中的序号
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }
  // 设置播放的为之前歌曲的下一首，也就是插入歌曲
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  // 获取在插入歌曲后的列表中，要插入的歌曲的索引
  let fsIndex = findIndex(sequenceList, song)
  // 下面的步骤逻辑其实是重复的，只不过上面的是播放列表操作，这里是顺序列表
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function ({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const savePlayHistory = function ({ commit }, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}
