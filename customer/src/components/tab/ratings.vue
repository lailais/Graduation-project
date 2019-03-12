<template>
  <div class="orderList" ref="orders">
    <div class="order-container" v-if="unpayList&&unpayList.shopList">
      <ul class="order-ul">
        <li v-for="(shopList , index) in unpayList.shopList" :key="index" class="sub-order-item">
          <div class="sub-order-id sub">清单{{shopList.subOrderListId}}</div>
          <div class="status sub">状态：{{getStatus(shopList.status)}}</div>
          <div class="background"></div>
          <ul class="order-detial">
            <li v-for="(subShopList , index) in shopList.subShopList" :key="index" class="select-shop-detial">
              <div>{{subShopList.name}}</div>
              <div>数量：{{subShopList.count}}</div>
              <div>单价：{{subShopList.price}}元</div>
            </li>
          </ul>
          <div class="sub-total sub">小计：{{shopList.subTotal}}元</div>
          <div class="time sub">下单时间：{{shopList.createTime|formatDate}}</div>
        </li>
      </ul>
      <div class="total">总计：{{unpayList.total}}元</div>
    </div>
    <div class="none-order" v-if="!unpayList||!unpayList.shopList">暂无订单</div>
  </div>
</template>

<script>
  import Split from '../Split'
  import BScoll from 'better-scroll'
  import {getTemplateDate} from '../../common/js/date'

  export default {
    name: 'Order',
    props: ['unpayList'],
    data() {
      return {
        orderScoll: null
      }
    },
    created() {
//      this.getRatingData()
//      console.log(this.unpayList)
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        vm._initScroll()
      })
    },
    computed: {
    },
    methods: {
      getStatus (status) {
        if (status) {
          return '已制作'
        } else {
          return '未制作'
        }
      },
//      getRatingData() {
//        console.log(this.unpayList)
//        this.axios.get('/api/ratings')
//          .then(res => {
//            res = res.data
//            if (res.errCode === 0) {
//              this.ratingList = res.data
//              this.$nextTick(() => {
//                this._initScroll()
//              })
//            }
//          })
//          .catch(err => {
//            console.log(err)
//          })
//      },
      _initScroll() {
        if (!this.orderScoll) {
          this.orderScoll = new BScoll(this.$refs.orders, {
            click: true
          })
        } else {
          this.orderScoll.refresh()
        }
      }
//      toggleHasContent() {
//        this.selectType.onlyContent = !this.selectType.onlyContent
//        this._initScroll() // 刷新页面scroll
//      }
    },
    filters: {
      formatDate(time) {
        let date = new Date(time)
        // 根据指定模板生成 对应模板的时间字符串
        return getTemplateDate(date, 'yyyy-MM-dd hh:mm')
      }
    },
    watch: {
      unpayList () {
        // 网络请求数据成功更新data,UI并没有重新渲染完毕
        this.$nextTick(() => {
          // DOM 更新整个页面渲染完毕
          // 将页面元素初始化成better-scroll 实例
          this._initScroll()
          console.log('aaa')
        })
      }
    },
    components: {
      Split
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../common/sass/mixin";

  .orderList {
    position: fixed;
    overflow: hidden;
    width: 100%;
    top: 175px;
    bottom: 46px;
    .order-container{
      width: 100%;
      .order-ul{
        width: 95%;
        margin: 10px auto;
        .sub-order-item{
          position: relative;
          width: 100%;
          padding-top: 10px;
          div.sub{
            font-size: 17px;
            &.sub-order-id{
              display: inline-block;
            }
            &.status{
              display: inline-block;
              margin-left: 50px;
            }
            &.sub-total{
              margin-left: 239px;
            }
            &.time {
              margin: 10px 0 20px;
            }
          }
          .background{
            position: absolute;
            left: -9px;
            top: 0;
            width: 100vw;
            height: 40px;
            background: #f3f5f7;
            z-index: -1;
          }
          .order-detial{
            margin: 20px 0;
            color: #4d555d;
            font-size: 16px;
            li{
              display: flex;
              div{
                width: 100%;
              }
            }
          }
          .split{
            margin-left: -9px;
          }
        }
      }
      .total{
        width: 100%;
        text-align: right;
        font-size: 17px;
        height: 40px;
        line-height: 40px;
        padding-right: 10px;
        box-sizing: border-box;
      }
    }
  }
</style>
