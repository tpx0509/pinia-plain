import { isReactive, isRef, toRaw, toRef, toRefs,ref, reactive } from "vue";



// let data = reactive({
//      name : ref('tianpx')
// })

// let data2 = toRaw(data)

// console.log('data',data.name) // reactive取值会自动拆包, 不需要.value

// console.log('data2',data2.name.value)

export function storeToRefs(store) {
    // store是proxy

    store = toRaw(store) // 使用原始数据，避免响应式数据取值时依赖收集

    const refs = {}
    for(let key in store) {
        let value = store[key]
        if(isRef(value) || isReactive(value)) { // 过滤掉了action等方法
            refs[key] = toRef(store,key)
        }
    }
    return store
}   