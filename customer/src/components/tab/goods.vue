<template>
    <div class="goodsView">
      <div class="goods">
        <div class="menuWrapper" ref="menuWrapper">
          <ul>
            <li v-for="(item , index) in goodsList"
                :key="item.name" class="menuItem"
                :class="{'current':currentIndex===index}"
                @click="_selectMenuGotoFoodList(index)"
            >
              <div class="menuName border-1px">
                <span class="icon" v-show="item.type>0" :class="classMap[item.type]"></span>
                <span class="name">{{item.name}}</span>
              </div>
              <div class="foodCount" v-show="selectMenuFoods[index]>0">{{selectMenuFoods[index]}}</div>
            </li>
          </ul>
        </div>
        <div class="foodsWrapper border-1px" ref="foodsWrapper">
          <ul>
            <li v-for="item in goodsList" :key="item.name" ref="foodList" >
              <h2 class="title">{{item.name}}</h2>
              <ul>
                <li v-for="food in item.foods" :key="food.name" class="foodItem" ref="foodItem">
                  <div class="icon">
                    <img :src="food.icon">
                  </div>
                  <div class="content">
                    <div class="name">{{food.name}}</div>
                    <div class="desc">{{food.description}}</div>
                    <div class="extra">
                      <span class="count"></span>
                      <!--<span class="rating">评价{{food.rating}}%</span>-->
                    </div>
                    <div class="price">
                      <span class="newPrice">&yen;{{food.price}}</span>
                      <span class="oldPrice" v-show="food.oldPrice">&yen;{{food.oldPrice}}</span>
                    </div>
                    <div class="addWrapper">
                      <keep-alive>
                      <add :food="food" @refreshFood="refreshFood" :drop="true"></add>
                    </keep-alive>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
</template>
<script>
  import BScroll from 'better-scroll'
  import add from '../add.vue'
export default {
  name: 'goods',
  props: {
    goodsList: Array,
    selectMenuFoods: Array
  },
  data () {
    return {
      classMap: ['decrease', 'discount', 'special', 'invoice', 'guarantee'],
      listHeight: [],
      scrollY: 0
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm._initScroll()
    })
  },
  components: {
    add
  },
  computed: {
    // 根据foodList滚动改变的scollY值判断当前在哪个listHeight范围
    currentIndex () {
      if (this.listHeight.length > 0) {
        for (let i = 0; i < this.listHeight.length; i++) {
          let height = this.listHeight[i]
          let nextHight = this.listHeight[i + 1]
          if (this.scrollY >= height && this.scrollY < nextHight) {
            return i
          } else if (!nextHight) {
            return i - 1
          }
        }
        return 0
      }
    }
  },
  methods: {
    _initScroll () {
      if (!this.menuScroll) {
        this.menuScroll = new BScroll(this.$refs.menuWrapper, {
          click: true
        })
      } else {
        this.menuScroll.refresh() // 刷新
      }
      // 切记在创建bScroll实例时,一定要确保该容器内部子元素完全渲染在页面上(BScroll)会根据内容元素计算用户最大滑动偏移量
      if (!this.foodScroll) {
        this.foodScroll = new BScroll(this.$refs.foodsWrapper, {
          click: true,
          probeType: 3 // 像素级探头监听 scroll
        })
      } else {
        this.foodScroll.refresh() // 刷新
      }
      this.foodScroll.on('scroll', (pos) => {
        // console.log(pos.y)
        this.scrollY = Math.abs(Math.round(pos.y))
      })
    },
    _calculateHeight () {
      let foodList = this.$refs.foodList // v-for 配合ref是一个数组
      let startHeight = 0 // 第一组食品起始坐标为0
      this.listHeight.push(startHeight)
      for (let i = 0; i < foodList.length; i++) {
        startHeight += foodList[i].clientHeight
        this.listHeight.push(startHeight)
      }
    },
    // 点击menu跳转到指定foodlist
    _selectMenuGotoFoodList (index) {
      this.foodScroll.scrollTo(0, -this.listHeight[index], 200)
    },
    refreshFood (food) {
      this.$emit('refreshAppFood', food)
    }
  },
  watch: {
    goodsList () {
      // 网络请求数据成功更新data,UI并没有重新渲染完毕
      this.$nextTick(() => {
        // DOM 更新整个页面渲染完毕
        // 将页面元素初始化成better-scroll 实例
        this._initScroll()
        // 获取每一组食物的高度
        this._calculateHeight()
      })
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/sass/mixin";

.goods{
  display: flex;
  overflow: hidden;
  width: 100%;
  position: fixed;
  top:175px;
  bottom:46px;
  .menuWrapper{
    flex: 0 0 80px;
    width: 80px;
    background: #f3f5f7;
    .menuItem{
      position: relative;
      width: 56px;
      height: 54px;
      padding: 0 12px;
      line-height: 14px;
      font-size: 0;
      display: table;
      &.current{
        background: #fff;
        bottom: 1px;
        .menuName{
          @include border-none
        }
      }
      .menuName{
        display: table-cell;
        vertical-align: middle;
        @include border-1px(rgba(7,17,27,.1));
        .name{
          font-size: 12px;
        }
        .icon {
          margin-top: 2px;
          display: inline-block;
          width: 12px;
          height: 12px;
          &.decrease {
            @include bg-img('../../common/img/decrease_3',12px 12px)
          }
          &.discount {
            @include bg-img('../../common/img/discount_3',12px 12px)
          }
          &.special {
            @include bg-img('../../common/img/special_3',12px 12px)
          }
          &.invoice {
            @include bg-img('../../common/img/invoice_3',12px 12px)
          }
          &.guarantee {
            @include bg-img('../../common/img/guarantee_3',12px 12px)
          }
        }
      }
      .foodCount {
        position: absolute;
        right: 0;
        top: 0;
        width: 16px;
        height: 16px;
        border-radius: 50% 50% 50% 0;
        background: rgb(240, 20, 20);
        font-size: 9px;
        font-weight: 700;
        color: #fff;
        text-align: center;
      }
    }
  }
  .foodsWrapper{
    flex: 1;
    .title{
      padding-left: 14px;
      height: 26px;
      line-height: 26px;
      font-size: 12px;
      border-left:2px solid #d9dde1;
      color: rgb(147,153,159);
      background: #f3f5f7;
    }
    .foodItem {
      display: flex;
      margin: 18px;
      padding-bottom: 18px;
      @include border-1px(rgba(7, 17, 27, 0.1));
      &:last-child {
        margin-bottom: 0;
        @include border-none
      }
      .icon {
        flex: 0 0 57px;
        margin-right: 10px;
        height: 57px;
        width: 57px;
        border-radius: 2px;
        overflow: hidden;
      }
      .content {
        flex: 1;
        .name {
          margin: 2px 0 8px;
          font-size: 14px;
          line-height: 14px;
          color: rgb(7, 17, 27);
        }
        .desc, .extra {
          font-size: 12px;
          line-height: 12px;
          color: rgb(147, 153, 159);
        }
        .desc {
          margin-bottom: 8px;
        }
        .count {
          margin-right: 12px;
        }
        .price {
          font-weight: 700;
          line-height: 24px;
          .newPrice {
            display: inline-block;
            margin-right: 8px;
            font-size: 14px;
            color: rgb(240, 20, 20);
          }
          .oldPrice {
            display: inline-block;
            vertical-align: top;
            text-decoration: line-through;
            font-size: 12px;
            line-height: 24px;
            color: rgb(147, 153, 159);
          }
        }
        .addWrapper{
           position: absolute;
           bottom: 18px;
           right: 0px;
         }
      }
    }
  }
}
</style>
