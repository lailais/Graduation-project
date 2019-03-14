<template>
  <div id="app">
    <EleHeader  :seller="seller"></EleHeader>
    <div class="tab">
      <div class="tab-item">
        <router-link to="/">点餐</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/ratings">已下单</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/seller">商家</router-link>
      </div>
    </div>
    <keep-alive>
      <router-view  :goodsList="goodsList"
                    :selectMenuFoods="selectMenuFoods"
                    @refreshAppFood="refreshAppFood"
                    :seller="seller"
                    :unpayList="unpayList"
                    :resetSelectList="resetSelectList"
      ></router-view>
    </keep-alive>
    <div class="shopCar">
      <shopCar ref="shopCar" :deliveryPrice="seller.deliveryPrice" :minPrice="seller.minPrice" :selectFoodList="selectFoodList" @refreshAppFood="refreshAppFood" :subOrderListId="subOrderListId" @resetSelectList="resetSelectList" @refreshSubOrderListId="refreshSubOrderListId"></shopCar>
    </div>
  </div>
</template>

<script>
  import EleHeader from './components/EleHeader.vue'
  import shopCar from './components/shopCar.vue'
export default {
  name: 'App',
  data () {
    return {
      seller: {},
      goodsList: [],
      selectFoodList: [],
      selectMenuFoods: [],
      unpayList: [],
      subOrderListId: 1
    }
  },
  components: {
    EleHeader,
    shopCar
  },
  created () {
    this.obtainData()
    this.getData()
  },
  sockets: {
    frombSeleted: function (data) { // 调用多次
      if (!data.unpayList && data.deskId === this.deskId) { // 点击结账后返回的unpayList是undefined
        this.unpayList = data.unpayList
        this.subOrderListId = 1 // 清单序号
        return
      }
      if (data.deskId === this.deskId) { // 判断商家更新数据是否为本桌数据
        this.unpayList = data.unpayList
        console.log('订单已更改')
      }
    }
  },
  mounted () {
    this.getOderInfo()
  },
  methods: {
    obtainData () { // 网络请求获取元数据
      this.axios.get('/api/seller').then(response => {
        let res = response.data
        if (res && res.errCode === 0) {
          this.seller = res.data
        }
      }).catch(err => {
        console.log('error:' + err)
      })
    },
    getData () {
      this.axios.get('api/goods').then(res => {
        res = res.data
        if (res && res.errCode === 0) {
          this.goodsList = res.data // 网络请求数据成功更新data,此时ui还未渲染
//          console.log(res.data)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    getOderInfo() {
      let deskId = window.location.hash.slice(3, 5)
      this.axios.get('http://localhost:3000/customerInfo', {
        params: {
          deskId
        }
      }).then(res => {
//        console.log(res)
        this.unpayList = res.data.unpayList
        if (this.unpayList) {
          for (let i = 0; i < this.unpayList.shopList.length; i++) { // 获取清单ID的最大值
            if (this.unpayList.shopList[i].subOrderListId > this.subOrderListId) {
              this.subOrderListId = this.unpayList.shopList[i].subOrderListId
            }
          }
          this.subOrderListId++
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    refreshAppFood (obj) {
//            console.log(obj)
      let targetFood = obj.food
      let foods = [] // 被添加的,无重复,有数量的商品
      let menuCount = [] // 左边菜单栏对应每组的商品个数
      this.goodsList.forEach(good => { // 遍历所有商品组
        let count = 0
        good.foods.forEach(food => { // 遍历每组的整组商品
          // 将同名食物更新count
          if (food.name === targetFood.name && food !== targetFood) { // 同名食物但不是同一个对象(即不是本身)
            if (!food.count) {
              this.$set(food, 'count', targetFood.count)
            } else {
              food.count = targetFood.count
            }
          } else if (food.count) { // 避免同名商品重复添加到购物车foods数组中
            for (var i = 0; i < foods.length; i++) {
              if (food.name === foods[i].name) {
                foods.splice(i, 1)
              }
            }
            foods.push(food)
          }
          if (food.count) { // 将每一组menu的数量计算清楚添加到menuCount数组中
            count += food.count
          }
        })
        menuCount.push(count)
      })
      this.selectFoodList = foods
      this.selectMenuFoods = menuCount

      if (obj.el) { // 出现小球
        this.$refs.shopCar.drop(obj.el)
      }
    },
    resetSelectList(data) { // 重置购物车
      this.unpayList = data
      this.selectFoodList = [] // 重置已选择列表
      this.selectMenuFoods = [] // 重置菜单选择组
      this.goodsList.forEach(good => { // 遍历所有商品组，重置add组件
        good.foods.forEach(food => { // 遍历每组的整组商品
           this.$set(food, 'count', 0)
        })
      })
    },
    refreshSubOrderListId() {
      this.subOrderListId++
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "./common/sass/mixin";
  #app {
    .tab {
      display: flex;
      width: 100%;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid rgba(7, 17, 27, 0.1);
    }
    .tab-item {
      flex: 1;
      text-align: center;
      a {
        display: block;
        font-size: 14px;
        color: rgb(77, 85, 93);
        &.active {
          color: rgb(240, 20, 20);
        }
      }
    }
    .shopCar{
      position: fixed;
      bottom: 0px;
      left: 0px;
    }
  }

</style>
