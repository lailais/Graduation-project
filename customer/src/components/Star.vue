<template>
  <div class="star" :class="starType">
    <div v-for="(item,index) in itemsClass" :key="index" :class="['starItem',item]"></div>
  </div>
</template>

<script>
  const LENGTH = 5 // 定义评分标准 总共几个星星
  const CLS_ON = 'on' // 全星
  const CLS_HALF = 'half' // 半星
  const CLS_OFF = 'off' // 无星
  export default {
    name: 'Star',
    props: {
      size: {
        type: Number,
        default: 24
      },
      score: {
        type: Number
      }
    },
    computed: {
      starType () {
        return 'star-' + this.size
      },
      itemsClass () {
        let score = Math.floor(this.score * 2) / 2
        let result = []

        for (var i = 1; i <= LENGTH; i++) {
          if (i <= score) { // 全星
            result.push(CLS_ON)
          } else if (i > score && i - 1 < score) { // 半星
            result.push(CLS_HALF)
          } else {
            result.push(CLS_OFF) // 无星
          }
        }
        return result
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../common/sass/mixin";

  .star {
    font-size: 0;
    .starItem {
      display: inline-block;
    }
    &.star-48 {
      .starItem {
        width: 20px;
        height: 20px;
        margin-right: 22px;
        &:last-child {
          margin-right: 0;
        }
        &.on {
          background: url("../common/img/star48_on@3x.png");
          @include bg-img("../common/img/star48_on", 20px 20px)
        }
        &.off {
          @include bg-img("../common/img/star48_off", 20px 20px)
        }
        &.half {
          @include bg-img("../common/img/star48_half", 20px 20px)
        }
      }
    }
    &.star-36 {
      .starItem {
        vertical-align: baseline;
        width: 15px;
        height: 15px;
        margin-right: 6px;
        &:last-child {
          margin-right: 0;
        }
        &.on {
          @include bg-img("../common/img/star36_on", 15px 15px)
        }
        &.off {
          @include bg-img("../common/img/star36_off", 15px 15px)
        }
        &.half {
          @include bg-img("../common/img/star36_half", 15px 15px)
        }
      }
    }
    &.star-24 {
      .starItem {
        width: 10px;
        height: 10px;
        margin-right: 3px;
        &:last-child {
          margin-right: 0;
        }
        &.on {
          @include bg-img("../common/img/star24_on", 10px 10px)
        }
        &.off {
          @include bg-img("../common/img/star24_off", 10px 10px)
        }
        &.half {
          @include bg-img("../common/img/star24_half", 10px 10px)
        }
      }
    }
  }
</style>
