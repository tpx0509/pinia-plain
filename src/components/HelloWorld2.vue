<script lang="ts">
import { mapState,mapActions,matWritableState } from '@/pinia'
import { useCounter } from '@/store/useCounter';
export default {
    computed: {
        ...mapState(useCounter,['count','double']),
        ...matWritableState(useCounter,['count2']), // 能读又能写
        ...mapState(useCounter,{ f : 'fruits'})
    },
    methods:{
      ...mapActions(useCounter,['increment'])
    },
    mounted() {
      console.log('this.increment',this.increment)
    }
}
</script>

<template>

  <div class="card">
    <button type="button" @click="increment(50)">count is {{ count }}</button>

    <button type="button">double is {{ double }}</button><br><br>

     <p>水果 : {{ f }}</p> 
     <button @click="(count2+=2)">{{count2}}</button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
