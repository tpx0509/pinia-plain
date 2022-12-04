import { computed, ref } from 'vue';
// import { defineStore } from 'pinia';
import { defineStore } from '@/pinia';


export const useCounter2 = defineStore('counter2',() => {
    let count = ref(0)
    let double = computed(() => count.value * 2)
    let increment = (payload:number) => {
         count.value += payload
    }

    return {
        count,
        double,
        increment
    }
})