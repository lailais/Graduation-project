<template>
  <div class="seller" ref="seller">
    <div>
      <div class="overView">
        <h2 class="name">{{seller.name}}</h2>
        <!--<div class="desc">-->
          <!--<Star :score="seller.score" :size="36"></Star>-->
          <!--<span class="text">({{seller.ratingCount}})</span>-->
          <!--<span class="text">月售{{seller.sellCount}}单</span>-->
        <!--</div>-->
        <!--<div class="rank">-->
          <!--<div class="block">-->
            <!--<h2>起送价</h2>-->
            <!--<div class="content">-->
              <!--<span class="num">{{seller.minPrice}}</span>元-->
            <!--</div>-->
          <!--</div>-->
          <!--<div class="block">-->
            <!--<h2>商家配送</h2>-->
            <!--<div class="content">-->
              <!--<span class="num">{{seller.deliveryPrice}}</span>元-->
            <!--</div>-->
          <!--</div>-->
          <!--<div class="block">-->
            <!--<h2>平均配送时间</h2>-->
            <!--<div class="content">-->
              <!--<span class="num">{{seller.deliveryTime}}</span>分钟-->
            <!--</div>-->
          <!--</div>-->
        <!--</div>-->
        <!--<div class="favorite" @click="toggleFavorite">-->
          <!--<i class="icon-favorite" :class="{active:favorite}"></i>-->
          <!--<span class="text">{{favorite?'已收藏':'收藏'}}</span>-->
        <!--</div>-->
      </div>
      <Split></Split>
      <div class="bulletin">
        <h2 class="name">公告与活动</h2>
        <div class="content">{{seller.bulletin}}</div>
        <div v-show="seller.supports&&seller.supports.length">
          <div class="support" v-for="(item,index) in seller.supports" :key="index">
            <span class="icon" :class="classMap[item.type]"></span>
            <span class="text">{{item.description}}</span>
          </div>
        </div>
      </div>
      <Split></Split>
      <div class="pic">
        <h2 class="name">商家实景</h2>
        <div class="picWrapper" ref="picWrapper">
          <ul ref="picList">
            <li class="picItem" v-for="(pic,index) in seller.pics" :key="index">
              <img :src="pic" width="120" height="90"/>
            </li>
          </ul>
        </div>
      </div>
      <div class="infos">
        <h2 class="name">商家信息</h2>
        <div class="info" v-for="info in seller.infos" :key="info">{{info}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import Star from '../Star'
  import Split from '../Split'
  import BScroll from 'better-scroll'

  export default {
    name: 'Seller',
    props: ['seller'],
    data() {
      return {
        favorite: true,
        classMap: ['decrease', 'discount', 'special', 'invoice', 'guarantee'],
        sellerScroll: null,
        picScroll: null
      }
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm._initSellerScroll()
      })
    },
    watch: {
      seller() {
        this.$nextTick(() => {
          this._initSellerScroll()
          this._initSellerSliderBar()
        })
      }
    },
    methods: {
      _initSellerScroll() {
        if (!this.sellerScroll) {
          this.sellerScroll = new BScroll(this.$refs.seller, {
            click: true
          })
        } else {
          this.sellerScroll.refresh()
        }
      },
      _initSellerSliderBar() {
        if (this.seller.pics) {
          let picLength = this.$refs.picList.childNodes.length
          let picWidth = this.getElementCss(this.$refs.picList.childNodes[0], 'width')
          let picMargin = this.getElementCss(this.$refs.picList.childNodes[0], 'margin-right')
          let picListWidth = (picWidth + picMargin) * picLength - picMargin
          // 强制指定picList宽度
          this.$refs.picList.style.width = picListWidth + 'px'
          this.$nextTick(() => {
            if (!this.picScroll) {
              this.picScroll = new BScroll(this.$refs.picWrapper, {
                scrollX: true
              })
            } else {
              this.picScroll.refresh()
            }
          })
        }
      },
      toggleFavorite() {
        // TODO:本地缓存
        this.favorite = !this.favorite
      },
      getElementCss(el, style) {
        if (el.currentStyle) { // 兼容ie
          return parseInt(el.currentStyle[style])
        } else {
          return parseInt(getComputedStyle(el, false)[style])
        }
      }
    },
    components: {
      Star,
      Split
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/sass/mixin";

  .seller {
    position: fixed;
    overflow: hidden;
    width: 100%;
    top: 175px;
    bottom: 46px;
    .name {
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 700;
      line-height: 14px;
      color: rgb(7, 17, 27);
    }
    .overView {
      position: relative;
      padding: 18px;
      font-size: 0;
      .desc {
        padding-bottom: 18px;
        @include border-1px(rgba(7, 17, 27, 0.1));
        .star {
          display: inline-block;
          vertical-align: top;
          margin: 2px 8px 0 0;
        }
        .text {
          display: inline-block;
          margin-right: 12px;
          font-size: 10px;
          line-height: 18px;
          color: rgb(77, 85, 93);
        }
      }
      .rank {
        display: flex;
        width: 100%;
        padding-top: 18px;
        .block {
          flex: 1;
          text-align: center;
          border-right: 1px solid rgba(7, 17, 27, 0.1);
          &:last-child {
            border-right: none;
          }
          h2 {
            margin-bottom: 4px;
            font-size: 10px;
            line-height: 10px;
            color: rgb(147, 153, 159);
          }
          .content {
            font-size: 10px;
            font-weight: 200;
            color: rgb(7, 17, 27);
            .num {
              font-size: 24px;
              line-height: 24px;
            }
          }
        }
      }
      .favorite {
        position: absolute;
        right: 16px;
        top: 16px;
        text-align: center;
        width: 36px; // 固定宽度避免偏移
        .icon-favorite {
          display: block;
          margin-bottom: 4px;
          font-size: 24px;
          line-height: 24px;
          color: rgb(147, 153, 159);
          &.active {
            color: rgb(240, 20, 20);
          }
        }
        .text {
          font-size: 10px;
          line-height: 10px;
          color: rgb(77, 85, 93);
        }
      }
    }
    .bulletin {
      padding: 18px 18px 0;
      font-size: 0;
      .content {
        padding: 0 12px;
        margin-bottom: 16px;
        font-size: 12px;
        line-height: 24px;
        font-weight: 200;
        color: rgb(240, 20, 20);
      }
      .support {
        padding: 16px 12px;
        border-top: 1px solid rgba(7, 17, 27, 0.1);
        .icon {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 6px;
          &.decrease {
            @include bg-img('../../common/img/decrease_4', 16px 16px)
          }
          &.discount {
            @include bg-img('../../common/img/discount_4', 16px 16px)
          }
          &.special {
            @include bg-img('../../common/img/special_4', 16px 16px)
          }
          &.invoice {
            @include bg-img('../../common/img/invoice_4', 16px 16px)
          }
          &.guarantee {
            @include bg-img('../../common/img/guarantee_4', 16px 16px)
          }
        }
        .text {
          font-size: 12px;
          font-weight: 200;
          vertical-align: top;
          line-height: 16px;
          color: rgb(7, 17, 27);
        }
      }
    }
    .pic {
      padding: 18px 0 18px 18px;
      font-size: 0;
      .picWrapper {
        height: 90px;
        white-space: nowrap; /*不换行*/
        overflow: hidden;
        width: 100%;
        .picItem {
          display: inline-block;
          margin-right: 6px;
          width: 120px;
          height: 90px;
          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
    .infos {
      padding: 16px 16px 0;
      font-size: 0;
      .info {
        padding: 16px 12px;
        border-top: 1px solid rgba(7, 17, 27, 0.1);
        font-size: 12px;
        font-weight: 200;
        line-height: 16px;
        color: rgb(7, 17, 27);
      }
    }
  }
</style>
