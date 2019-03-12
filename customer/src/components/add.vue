<template>
    <div class="add">
      {{food}}
      <div class="icon-add_circle" @click.stop.prevent="doAdd" ref="add"></div>
      <transition name="b">
        <div class="num" v-show="food.count>0" >{{food.count}}</div>
      </transition>
      <transition name="a" >
        <div class="icon-remove_circle_outline" v-show="food.count>0" @click.stop.prevent="doDel" ></div>
      </transition>
    </div>
</template>
<script>
export default {
  props: ['food', 'drop'],
  data () {
    return {
    }
  },
  methods: {
    doAdd (event) {
      if (!this.food.count) {
        this.$set(this.food, 'count', 1)
      } else {
        this.food.count++
      }
      let el = this.drop ? event.target : null
      this.$emit('refreshFood', {food: this.food, el})
//      console.log(el)
    },
    doDel () {
      if (this.food.count > 0) {
        this.food.count--
      }
      this.$emit('refreshFood', {food: this.food})
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.add{
  font-size: 0px;
  height: 24px;
  .icon-add_circle{
    display: inline-block;
    font-size: 24px;
    color:rgb(0,160,220);
    line-height: 24px;
    float: right;
  }
  .icon-remove_circle_outline{
    display: inline-block;
    font-size: 24px;
    color:rgb(0,160,220);
    line-height: 24px;
    /*float: right;*/
  }
  .a-enter-active,.a-leave-active ,.b-enter-active,.b-leave-active{
    transition: all 0.5s ;
  }
  .a-enter{ /*a-enter显示的第一帧 a-leave-to离开的最后一帧*/
    transform: translateX(48px) rotate(360deg);
  }
  .b-enter{
    transform: translateX(24px) rotate(360deg);
  }
  .a-leave-to{
    transform: translateX(48px) rotate(360deg);
  }
  .b-leave-to{
    transform: translateX(24px) rotate(360deg);
  }
  .num{
    width: 24px;
    height: 24px;
    text-align: center;
    float: right;
    line-height:24px ;
    font-size: 10px;
  }
}
</style>
