import { createApp } from 'vue'
// import { createPinia } from 'pinia'
import { createPinia } from '@/pinia'
import './style.css'
import App from './App.vue'

const app = createApp(App)

const pinia = createPinia()


pinia.use(({ store,$id }) => { // 插件就是一个函数，use是用来注册插件的
    // let data =localStorage.getItem(`store${$id}`)
    // if(data) {
    //     store.$state = JSON.parse(data)
    // }
    // store.$subscribe((msg,state) => {
    //     localStorage.setItem(`store${$id}`,JSON.stringify(state))
    // })
})

app.use(pinia)

app.mount('#app')
