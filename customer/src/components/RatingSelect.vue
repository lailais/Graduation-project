<template>
  <div class="ratingSelect">
    <div class="typeSelect border-1px">
      <div class="inlineBlock positive"
           :class="{active:selectType.type===2}"
           @click="selectRateType(2)">
        <span class="type">{{selectType.desc.all}}</span>
        <span class="num">{{ratings.length}}</span>
      </div>
      <div class="inlineBlock positive"
           :class="{active:selectType.type===0}"
           @click="selectRateType(0)">
        <span class="type">{{selectType.desc.positive}}</span>
        <span class="num">{{positiveLength}}</span>
      </div>
      <div class="inlineBlock negative"
           :class="{active:selectType.type===1}"
           @click="selectRateType(1)">
        <span class="type">{{selectType.desc.negative}}</span>
        <span class="num">{{negativeLength}}</span>
      </div>
    </div>
    <div class="hasContent" @click="toggleHasContent" :class="{active:selectType.onlyContent}">
      <i class="icon-check_circle"></i>
      <span class="text">只看有内容的评价</span>
    </div>
  </div>
</template>

<script>
  const ALL = 2
  const POSITIVE = 0
  const NEGATIVE = 1
  export default {
    name: 'RatingSelect',
    props: {
      ratings: {
        type: Array,
        default() {
          return []
        }
      },
      selectType: {
        type: Object,
        default() {
          return {
            type: ALL,
            onlyContent: true,
            desc: {
              all: '全部',
              positive: '满意',
              negative: '不满意'
            }
          }
        }
      }
    },
    computed: {
      positiveLength() {
        let num = 0
        this.ratings.forEach(item => {
          if (item.rateType === POSITIVE) {
            num++
          }
        })
        return num
      },
      negativeLength() {
        let num = 0
        this.ratings.forEach(item => {
          if (item.rateType === NEGATIVE) {
            num++
          }
        })
        return num
      }
    },
    methods: {
      selectRateType(type) {
        this.$emit('selectRateType', type)
      },
      toggleHasContent() {
        this.$emit('toggleHasContent')
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../common/sass/mixin";

  .ratingSelect {
    padding: 18px 18px 0 18px;
    border-bottom: 1px solid rgba(7, 17, 27, 0.1);
    .typeSelect {
      padding-bottom: 18px;
      @include border-1px(rgba(7, 17, 27, 0.1));
      .inlineBlock {
        display: inline-block;
        margin-right: 8px;
        padding: 8px 12px;
        border-radius: 2px;
        height: 16px;
        line-height: 16px;
        color: rgb(77, 85, 93);
        font-size: 0;
        &.active {
          color: #fff;
        }
        .type {
          margin-right: 2px;
          font-size: 16px;
        }
        .num {
          font-size: 12px;
        }
        &.positive {
          background: rgba(0, 160, 220, 0.2);
          &.active {
            background: rgb(0, 160, 220);
          }
        }
        &.negative {
          background: #E9EBEC;
          &.active {
            background: rgb(77, 88, 93);
          }
        }
      }
    }
    .hasContent {
      padding: 12px 0;
      font-size: 0;
      &.active {
        .icon-check_circle {
          color: #00b43c;
        }
      }
      .icon-check_circle {
        vertical-align: top;
        display: inline-block;
        margin-right: 4px;
        line-height: 24px;
        font-size: 24px;
        color: rgb(147, 153, 159);
      }
      .text {
        display: inline-block;
        line-height: 24px;
        font-size: 12px;
        color: rgb(147, 153, 159);
      }
    }
  }
</style>
