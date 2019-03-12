<template>
  <div class="shopCar">
    <transition name="selectFoodWrapper">
      <div class="selectFoodWrapper" v-show="listShow" @click="hideList"></div>
    </transition>
    <transition name="selectFood">
      <div class="selectFood" v-show="listShow">
        <div class="nav">
          <span class="cart">购物车</span>
          <span class="clear">清空</span>
        </div>
        <div class="foodListWrapper" ref="foodList">
          <ul class="foodList">
            <li v-for="(item, index) in selectFoodList" :key="index" class="foodItem border-1px">
              <div class="name">{{item.name}}</div>
              <div class="price">&yen;{{item.price}}</div>
              <div class="addWrapper">
                <add :food="item" @refreshFood="refreshFood"></add>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </transition>
    <div class="bottomWrapper">
      <div class="carWrapper" @click="fadeToggle">
        <div class="car" :class="{highlight: totalCount > 0}">
          <i class="icon-shopping_cart"></i>
        </div>
        <div class="num" v-show="totalCount>0">{{totalCount}}</div>
      </div>
      <div class="con" @click="fadeToggle">
        <div class="money" :class="{highlight: totalPrice > 0}">&yen;{{totalPrice}}</div>
        <!--<div class="send">另需配送费&yen;{{deliveryPrice}}</div>-->
      </div>
      <div class="atLeast" :class="{highlight: totalPrice > 0 }" @click="pay" ref="pay">{{payBtnText}}</div>
    </div>
    <div class="ballWrapper" v-for="(ball,index) in balls" :key="index">
      <transition @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter">
        <div class="ball" v-show="ball.show" :data-index="index">
          <div class="inner"></div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
  import add from './add.vue'
  import BScroll from 'better-scroll'

  export default {
    props: ['minPrice', 'deliveryPrice', 'selectFoodList', 'subOrderListId'],
    data() {
      return {
        show: false,
        foodScrollView: null,
        balls: [
          {show: false},
          {show: false},
          {show: false},
          {show: false},
          {show: false}
        ]
      }
    },
    components: {
      add
    },
    computed: {
      totalPrice() {
        let price = 0
        this.selectFoodList.forEach(food => {
          price += food.count * food.price
        })
//      console.log(this.selectFoodList)
        return price
      },
      totalCount() {
        let count = 0
        this.selectFoodList.forEach(food => {
          count += food.count
        })
        return count
      },
      payBtnText() {
        if (this.totalPrice === 0) {
          return `请选择菜品`
        } else {
          return `去下单`
        }
      },
      listShow() {
        if (!this.totalCount) {
          this.hideList()
          return false
        } else {
          if (this.show) {
            this.initBscroll()
          }
          return this.show
        }
      }
    },
    methods: {
      drop(el) { // el add按钮 出现小球的函数
        // 做判断判断哪个小球展示
        for (let i = 0; i < this.balls.length; i++) {
          let ball = this.balls[i]
          if (ball.show) {
            continue
          }
          ball.show = true
          this.$set(ball, 'el', el)
          break
        }
      },
      beforeEnter(el) { // 小球将要进入
        // 获取+号的位置
        let index = parseInt(el.getAttribute('data-index'))
        let ball = this.balls[index]
        let rect = ball.el.getBoundingClientRect() // 获取元素右下角距离上右下左的位置
        let x = rect.left - 32
        let y = -(window.innerHeight - rect.top - 22)
        el.style.transform = `translateY(${y}px)`
        let inner = el.getElementsByClassName('inner')[0]
        inner.style.transform = `translateX(${x}px)`
      },
      enter(el, done) { // 小球进入中
        let rf = el.offsetHeight // 强制刷新
        if (rf) {
        }
        this.$nextTick(() => {
          el.style.transform = `translateY(0)`
          let inner = el.getElementsByClassName('inner')[0]
          inner.style.transform = `translateX(0)`
          el.addEventListener('transitionend', done)
        })
      },
      afterEnter(el) { // 小球进入完毕
        let index = parseInt(el.getAttribute('data-index'))
        this.balls[index].show = false
        el.style.display = 'none'
      },
      initBscroll() {
        this.$nextTick(() => {
          if (!this.foodScrollView) {
            this.foodScrollView = new BScroll(this.$refs.foodList, {
              click: true
            })
          } else {
            this.foodScrollView.refresh()
          }
        })
      },
      fadeToggle() {
        if (!this.totalCount) {
          return
        }
        this.show = !this.show
      },
      hideList() {
        this.show = false
      },
      refreshFood(food) {
        this.$emit('refreshAppFood', food)
      },
      pay() {
        if (!this.totalPrice) {
          return
        }
//        console.log(this.selectFoodList)
//        console.log(this.subOrderListId)
        this.$socket.emit('cSelected', { // 向后台触发cSelected事件,并传参
          'cSelected': this.selectFoodList,
          'subOrderListId': this.subOrderListId,
          'deskId': this.deskId,
          'subTotal': this.totalPrice,
          'status': 0
        })
        let o = this
        this.$socket.on('message', function (data) { // 调用多次
          if (data.status) {
            o.$emit('resetSelectList', data.unpayList)
          }
        })
        alert('下单成功！！')
        this.$emit('refreshSubOrderListId')
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../common/sass/mixin";

  .shopCar {
    position: absolute;
    bottom: 0px;
    height: 46px;
    width: 100%;
    box-sizing: border-box;
    /*padding: 0 8px 0 12px;*/
    background: #141d27;
    color: rgba(255, 255, 255, .4);
    z-index: 20;
    .bottomWrapper {
      position: absolute;
      left: 0px;
      padding: 0 8px 0 12px;
      width: 100%;
      height: 46px;
      z-index: 10;
      background: #141d27;
      box-sizing: border-box;
      .carWrapper {
        display: inline-block;
        position: absolute;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #141d27;
        bottom: 2px;
        .car {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, .2);
          margin: 0 auto;
          text-align: center;
          margin-top: 5px;
          &.highlight {
            background: rgb(0, 160, 220);
            color: white;
          }
          .icon-shopping_cart {
            position: relative;
            font-size: 24px;
            line-height: 40px;
          }
        }
        .num {
          position: absolute;
          right: 0;
          top: 0;
          display: table-cell;
          vertical-align: middle;
          width: 24px;
          height: 16px;
          line-height: 16px;
          border-radius: 9px;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          color: #fff;
          background: rgb(240, 20, 20);
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
        }
      }
      .con {
        position: absolute;
        top: 14px;
        left: 80px;
        font-size: 0px;
        .money {
          display: inline-block;
          font-size: 16px;
          font-weight: 700;
          /*padding-right: 12px;*/
          /*border-right: 1px solid rgba(255, 255, 255, .4);*/
          &.highlight {
            color: white;
          }
        }
        .send {
          display: inline-block;
          font-size: 14px;
          font-weight: 200;
          padding-left: 12px;
        }
      }
      .atLeast {
        position: absolute;
        right: 0px;
        top: 0;
        width: 105px;
        height: 46px;
        text-align: center;
        line-height: 46px;
        background: rgba(255, 255, 255, .2);
        &.highlight {
          background: #00b43c;
          color: white;
        }
      }
    }

    .selectFoodWrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.6);
      opacity: 1;
      z-index: -10;
      transition: all 0.4s ease;
      &.selectFoodWrapper-enter, &.selectFoodWrapper-leave-to {
        opacity: 0;
      }
    }
    .selectFood {
      position: absolute;
      width: 100%;
      background: white;
      bottom: 0px;
      left: 0px;
      color: black;
      transform: translateY(-46px);
      transition: all 0.4s ease;
      z-index: -1;
      &.selectFood-enter, &.selectFood-leave-to {
        transform: translateY(0px);
        opacity: 0;
      }
      .nav {
        width: 100%;
        height: 40px;
        background: #f3f5f7;
        border-bottom: 1px solid rgba(7, 17, 27, .1);
        .cart {
          line-height: 40px;
          float: left;
          font-size: 14px;
          color: rgb(7, 17, 27);
          padding-left: 18px;
        }
        .clear {
          line-height: 40px;
          float: right;
          font-size: 12px;
          color: rgb(0, 160, 220);
          padding-right: 18px;
        }
      }
      .foodListWrapper {
        max-height: 220px;
        overflow: hidden;
        width: 100%;
        .foodList {
          width: 100%;
          padding: 0 18px;
          box-sizing: border-box;
          .foodItem {
            position: relative;
            width: 100%;
            height: 48px;
            line-height: 48px;
            @include border-1px(rgba(7, 17, 27, .1));
            .name {
              /*display: inline-block;*/
              font-size: 14px;
              color: rgb(7, 17, 27);
            }
            .price {
              position: absolute;
              font-size: 14px;
              font-weight: 700;
              color: rgb(240, 20, 20);
              top: 0px;
              right: 84px;
            }
            .addWrapper {
              width: 72px;
              position: absolute;
              right: 0px;
              bottom: 12px;
            }
          }
        }
      }

    }
    .ballWrapper {
      .ball {
        position: fixed;
        left: 32px;
        bottom: 22px;
        z-index: 200;
        transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41);
        .inner {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgb(0, 160, 220);
          transition: all 0.4s linear;
        }
      }
    }
  }
</style>
