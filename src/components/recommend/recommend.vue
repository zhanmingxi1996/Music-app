<template>
  <div>recommend。</div>
</template>

<script type="text/ecmascript-6">
  import { getRecommend } from 'api/recommend'

  export default {
    created() {
      this._getRecommend()
    },
    methods: {
      _getRecommend() {
        getRecommend().then((res) => {
          console.log(res)
        })
      }
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>