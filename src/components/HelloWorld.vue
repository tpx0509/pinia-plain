<script setup lang="ts">
import { storeToRefs } from '@/pinia';
import { useCounter } from '@/store/useCounter'
import { useCounter2 } from '@/store/useCounter2'

const store = useCounter()
const store2 = useCounter2()

const { count,double } = storeToRefs(store2) as any

const { increment } = store
defineProps<{ msg: string }>()
console.log('store',store)
console.log('store2',store2)
console.log('stote.$state',store.$state)
store.$subscribe((store,state) => {
   console.log('变化了',store,state)
})

store.$onAction(({after,onError},name) => {
  console.log('action running',name)
   after((res) => {
     console.log('after',res)
   })
   after((res) => {
     console.log('after2',res)
   })
   onError((res) => {
     console.error('错误onerror',res)
   })
})
function reset() {
  store.$reset()
}

function handleClick() {
   let fruits = [...store.fruits,'葡萄']
   store.$patch({
      count : ++store.count,
      fruits
   })
  //  store.$patch((store) => {
  //   store.count++
  //   store.fruits.push('葡萄')
  //  })
}
function dispose() {
   store.$dispose()
}
function change() {
  store.$state = {
     count : 1000
  }
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="store.count++">count is {{ store.count }}</button>

    <button type="button">double is {{ store.double }}</button><br><br>
    <button type="button" @click="() => increment(2)">count2 is {{ store.count2 }}</button>
    <button @click="handleClick">patch</button>
    <button @click="reset">重置</button>
    <button @click="change">通过$state修改</button>

    <button @click="dispose">销毁响应式</button>
    <span v-for="item in store.fruits">{{item}}</span>
    
    <button type="button">double2 is {{ store.double2 }}</button>
    <p>---------setup----------------
    </p>

    <button type="button" @click="store2.increment(2)">count is {{ count }}</button>

    <button type="button">double is {{ double }}</button><br><br>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
