// import { defineStore } from 'pinia';
import { defineStore } from '@/pinia';


export const useCounter = defineStore('counter1',{
    state: () => {
        return {
            count: 0,
            count2: 0,
            fruits : ['苹果','香蕉']
        }
    },
    getters:{
        double:(store) =>  store.count * 2,
        double2(store) {
            return this.count2 * 2
        }
    },
    actions :{
        increment(payload) {
            return new Promise((resolve) => {
                this.count2+=payload
                setTimeout(() => {
                    resolve(this.count2)
                }, 1000);
            })
            
        }
    }
})