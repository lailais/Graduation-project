<template>
  <div class="header">
    <div class="contentWrapper">
      <div class="avatar">
        <img :src="seller.avatar" width="64" height="64"/>
      </div>
      <div class="content">
        <div class="title">
          <span class="brand"></span>
          <span class="name">{{seller.name}}</span>
        </div>
        <div class="desc">
          <!--{{seller.description}}/{{seller.deliveryTime}}分钟送达-->
        </div>
        <div v-if="seller.supports" class="supportsWrapper" ref="aa">
          <transition-group tag="ul" name="slider" class="supports">
            <li v-for="(item, index) in seller.supports"   :key="index" v-show="index===currentNum" >
              <div class="icon" :class="classMap[item.type]"></div>
              <div class="text">{{item.description}}</div>
            </li>
          </transition-group>
        </div>
      </div>
      <div class="supportCount">
        <div class="count" @touchstart="showDetail">
          <span class="num">{{seller.supports ? seller.supports.length : 0}}个</span>
          <i class="icon-keyboard_arrow_right"></i>
        </div>
      </div>
    </div>
    <div class="bulletinWrapper" @touchstart="showDetail">
      <span class="bulletinIcon"></span>
      <span class="bulletinText">{{seller.bulletin}}</span>
      <i class="icon-keyboard_arrow_right" ></i>
    </div>
    <div class="bg">
      <img :src="seller.avatar" width="100%"/>
    </div>
    <transition name="fade">
    <div class="detail" v-show="detailShow">
      <div class="detailWrapper">
        <div class="detailMain">
          <h2 class="name">{{seller.name}}</h2>
          <div class="starWrapper">
            <star :score="seller.score" :size="48"></star>
          </div>
          <div class="title">
            <div class="line"></div>
            <div class="text">优惠信息</div>
            <div class="line"></div>
          </div>
          <div v-if="seller.supports" class="support">
            <div class="supportItem" v-for="(item,index) in seller.supports" :key="index">
              <div class="icon" :class="classMap[item.type]"></div>
              <div class="text">{{item.description}}</div>
            </div>
          </div>
          <div class="title">
            <div class="line"></div>
            <div class="text">商家公告</div>
            <div class="line"></div>
          </div>
          <div class="content">{{seller.bulletin}}</div>
        </div>
      </div>
      <div class="detailClose">
        <i class="icon-close" @touchstart="hideDetail"></i>
      </div>
    </div>
    </transition>
  </div>
</template>

<script>
  import star from './Star.vue'
  export default {
    name: 'EleHeader',
    props: {
      seller: {
        type: Object,
        required: true
      }
    },
    components: {
      star
    },
    data () {
      return {
        currentNum: 0,
        classMap: ['decrease', 'discount', 'special', 'invoice', 'guarantee'],
        detailShow: false
      }
    },
    mounted () {
//      console.log(this.$refs.aa)
      setInterval(() => {
        this.currentNum++
        if (this.currentNum > this.seller.supports.length - 1) {
          this.currentNum = 0
        }
      }, 3000)
    },
    methods: {
      showDetail () {
      this.detailShow = true
      },
      hideDetail () {
        this.detailShow = false
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../common/sass/mixin";
  /* 当前页面的css 样式只会作用于当前组件*/
  .header {
    color: #fff;
    background: rgba(7, 17, 27, 0.5);
    overflow: hidden;
  }

  .contentWrapper {
    padding: 24px 12px 18px 24px;
    font-size: 0;
    display: flex;
    .avatar {
      flex: 0 0 64px;
      display: inline-block;
      border-radius: 2px;
      overflow: hidden;
    }
    .content {
      flex: 1;
      display: inline-block;
      margin-left: 16px;
      overflow: hidden;
      .title {
        margin: 2px 0 8px;
        .brand {
          display: inline-block;
          width: 30px;
          height: 18px;
          @include bg-img('../common/img/brand', 30px 18px);
          vertical-align: top;
          margin-right: 6px;
        }
        .name {
          font-size: 16px;
          font-weight: bold;
          line-height: 18px;
        }
      }
      .desc {
        margin-top: 30px;
        margin-bottom: 9px;
        font-size: 13px;
        font-weight: 200;
        line-height: 13px;
      }
      .supportsWrapper {
        height: 12px;
        width: 100%;
        overflow: hidden;
        .supports {
          width: 100%;
          height: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          li{
            position: absolute;
            left: 0;
            top: 0;
          }
          .slider-enter { // 进入第一帧
            transform: translateY(100%);
            -webkit-transform: translateY(100%);
          }
          .slider-enter-active {  // 出现过程
            -webkit-transition: all .6s ease;
            transition: all .6s ease;
          }
          .slider-leave-active { // 离开过程
            transform: translateY(-150%);
            -webkit-transform: translateY(-150%);
            -webkit-transition: all .6s ease;
            transition: all .6s ease;
          }
          .text {
            height: 10%;
            display: inline-block;
            margin-left: 4px;
            font-size: 10px;
            line-height: 12px;
            font-weight: 200;
          }
          .icon {
            display: inline-block;
            width: 12px;
            height: 12px;
            vertical-align: top;
            &.decrease {
              @include bg-img('../common/img/decrease_1',12px 12px)
            }
            &.discount {
              @include bg-img('../common/img/discount_1',12px 12px)
            }
            &.special {
              @include bg-img('../common/img/special_1',12px 12px)
            }
            &.invoice {
              @include bg-img('../common/img/invoice_1',12px 12px)
            }
            &.guarantee {
              @include bg-img('../common/img/guarantee_1',12px 12px)
            }
          }
        }
      }
    }
    .supportCount {
      flex: 0 0 48px;
      position: relative;
      .count {
        position: absolute;
        display: inline-block;
        bottom: 0;
        padding: 7px 8px;
        border-radius: 13px;
        background: rgba(0, 0, 0, 0.2);
        text-align: center;
        .num {
          font-size: 10px;
          line-height: 12px;
          font-weight: 200;
        }
        .icon-keyboard_arrow_right {
          position: relative;
          top: 1px;
          font-size: 10px;
          line-height: 12px;
          font-weight: 200;
        }
      }
    }
  }
  .bulletinWrapper {
    position: relative;
    overflow: hidden;
    height: 28px;
    line-height: 28px;
    padding: 0 20px 0 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    .bulletinIcon{
      display: inline-block;
      width: 22px;
      height: 12px;
      vertical-align:middle;
      @include bg-img('../common/img/bulletin',22px 12px)
    }
    .bulletinText{
      line-height: 28px ;
      font-size: 12px;
    }
    i{
      position: absolute;
      right: 2px;
      top:8px;
    }
  }
  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 134px;
    z-index: -1;
    filter: blur(10px);
    overflow: hidden;
  }
  .detail {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    overflow: auto;
    background: rgba(7, 17, 27, 0.8);
    /*模糊图片效果, 不会影响到子类*/
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    opacity: 1;
    transition: all 0.6s ease;
    &.fade-enter, &.fade-leave-to {
      opacity: 0;
    }
  }
  .detailWrapper {
    width: 100%;
    min-height: 100%;
    display: inline-block;
    .detailMain {
      margin: 64px 36px;
      .name {
        text-align: center;
        font-size: 16px;
        line-height: 16px;
        font-weight: 700;
      }
      .starWrapper {
        margin: 16px;
        text-align: center;
      }
      .title {
        margin: 28px auto 24px;
        display: flex;
        .line {
          flex: 1;
          position: relative;
          top: -7px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        .text {
          font-size: 14px;
          line-height: 14px;
          font-weight: 700;
          margin: 0 12px;
        }
      }
      .supportItem {
        padding: 0 12px;
        margin-bottom: 12px;
        .icon {
          display: inline-block;
          margin-right: 6px;
          width: 16px;
          height: 16px;
          vertical-align: top;
          &.decrease {
            @include bg-img('../common/img/decrease_2', 16px 16px)
          }
          &.discount {
            @include bg-img('../common/img/discount_2', 16px 16px)
          }
          &.special {
            @include bg-img('../common/img/special_2', 16px 16px)
          }
          &.invoice {
            @include bg-img('../common/img/invoice_2', 16px 16px)
          }
          &.guarantee {
            @include bg-img('../common/img/guarantee_2', 16px 16px)
          }
        }
        .text {
          display: inline-block;
          font-size: 12px;
          line-height: 16px;
        }
      }
      .content {
        padding: 0 12px;
        font-size: 12px;
        line-height: 24px;
      }
    }
  }
  .detailClose {
    text-align: center;
    margin-top:-64px;
    .icon-close{
      color:rgba(255,255,255,.5);
      font-size: 32px;
    }
  }
</style>
