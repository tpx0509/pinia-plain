import { markRaw, effectScope, App, ref } from "vue";
export const piniaSymbol = Symbol("pinia");
export let activePinia = null
export let setActivePinia = (pinia) => activePinia = pinia
export function createPinia() {
  let scope = effectScope(true); // 可以停止所有响应式

  const state = scope.run(() => ref({})); // 用来存储每个store
  const pinia = markRaw({
    _s: new Map(), // 存放所有store // { counter => store, counter2 => store}
    install(app: App) {
      // pinia要去收集所有store的信息，它管理所有的store

      setActivePinia(pinia) // 放在全局。 无法使用provide时避免找不到pinia

      // 把自己提供给各个store,让所有的store都可以获取这个pinia对象
      app.provide(piniaSymbol, pinia); // 所有组件都可以通过 app.inject(piniaSymbol)获取

      // this.$pinia
      app.config.globalProperties.$pinia = pinia; // vue2的组件实例也可以共享

      this._a = app
    },
    use(plugin) {
      this._p.push(plugin)
      return this
    },
    _a : null,
    _p : [],
    _e: scope,
    state,
  });
  return pinia;
}

// createPinia 默认是一个插件 具备一个install方法
// _s 用来存储 id-> store
// state 用来存储所有状态
// _e 用来停止所有状态