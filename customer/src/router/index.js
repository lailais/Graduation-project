import Vue from 'vue'
import Router from 'vue-router'
import goods from '../components/tab/goods.vue'
import seller from '../components/tab/seller.vue'
import ratings from '../components/tab/ratings.vue'

Vue.use(Router)

export default new Router({
  linkExactActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'goods',
      component: goods,
      props: true
    },
    {
      path: '/seller',
      name: 'seller',
      component: seller,
      props: true
    },
    {
      path: '/ratings',
      name: 'ratings',
      component: ratings,
      props: true
    }
  ]
})
