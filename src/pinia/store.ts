import { activePinia, piniaSymbol, setActivePinia } from "./createPinia";
import {
  getCurrentInstance,
  inject,
  toRefs,
  reactive,
  effectScope,
  computed,
  isRef,
  isReactive,
  watch,
} from "vue";
import { addSubscription, triggerSubscriptions } from "./subscribe";

export function defineStore(idOrOptions: any, setup: any) {
  let id: any;
  let options: any;
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = setup;
  } else {
    id = idOrOptions.id;
    options = idOrOptions;
  }
  let isSetupStore = typeof setup === "function";

  function useStore() {
    // 使用的拿到的store应该是同一个

    let instance = getCurrentInstance();
    let pinia: any = instance && inject(piniaSymbol);

    if(pinia) {
       setActivePinia(pinia)
    }
    pinia = activePinia
    if (!pinia._s.has(id)) {
      // 第一次useStore
      // 如果是第一次则创建映射关系
      if (isSetupStore) {
        createSetupStore(id, setup, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
    }
    // 后续通过id 获取对应的store返回
    const store = pinia._s.get(id);
    console.log('store',store)
    return store;
  }
  return useStore;
}

function mergeReactiveObject(target, state) {
  for (let key in state) {
    if (!state.hasOwnProperty(key)) continue;
    let oldVal = target[key];
    let val = state[key];
    // 状态有可能是ref ref也是一个对象不能递归
    if (isObject(val) && isObject(oldVal) && !isRef(val)) {
      target[key] = mergeReactiveObject(oldVal, val);
    } else {
      target[key] = val;
    }
  }
  return target;
}
function createSetupStore(
  id: string,
  setup: any,
  pinia: any,
  isOption?: boolean
) {
  // 后续一些不是用户定义的属性和方法，内置的api会增加到这个store上

  function $patch(partialStateOrMutatior) {
    if (isObject(partialStateOrMutatior)) {
      // 把新的状态合并到老的状态上
      mergeReactiveObject(pinia.state.value[id], partialStateOrMutatior);
    } else {
      // 函数直接执行
      partialStateOrMutatior(pinia.state.value[id]);
    }
  }
  let actionSubscriptions = [];
  let partialStore = {
    $patch,
    $subscribe(callback, options) {
      // 每次状态变化都会触发此函数
      scope.run(() => {
        watch(
          pinia.state.value[id],
          (state) => {
            callback({ storeId: id }, state);
          },
          options
        );
      });
    },
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $dispose() {
      // 销毁
      scope.stop(); // 清除响应式
      actionSubscriptions = []; // 取消订阅
      pinia._s.delete(id);
    },
  };
  const store: any = reactive(partialStore); // store就是一个响应式对象
  let scope;

  const initialState = pinia.state.value[id]; // 对于setup api 是没有初始化过状态的

  if (!initialState && !isOption) {
    pinia.state.value[id] = {};
  }

  // 父亲可以停止所有，setup是用户传递的属性和方法
  const setupStore = pinia._e.run(() => {
    scope = effectScope(); // 自己可以停止自己
    return scope.run(() => setup());
  });

  function wrapAction(name: string, action: () => any) {
    // aop函数切片  给actions包裹一层 1是改变this，2是可以增加其他操作
    return function () {
      let afterCallbackList = [];
      let errorCallbackList = [];

      function after(cb) {
        addSubscription(afterCallbackList, cb);
      }
      function onError(cb) {
        addSubscription(errorCallbackList, cb);
      }
      triggerSubscriptions(actionSubscriptions, {
        name,
        after,
        onError,
      }, name);
      let ret;
      try {
        ret = action.apply(store, arguments as any);
      } catch (err) {
        triggerSubscriptions(errorCallbackList, err);
        throw err;
      }
      if (ret instanceof Promise) {
        return ret
          .then((res) => {
            triggerSubscriptions(afterCallbackList, res);
            return res;
          })
          .catch((err) => {
            triggerSubscriptions(errorCallbackList, err);
            return Promise.reject(err);
          });
      }

      triggerSubscriptions(afterCallbackList, ret);

      return ret;
    };
  }
  for (let key in setupStore) {
    const prop = setupStore[key];
    if (typeof prop === "function") {
      // 处理actions
      setupStore[key] = wrapAction(key, prop);
    }
    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      if (!isOption) {
        pinia.state.value[id][key] = prop;
      }
    }
  }
  Object.assign(store, setupStore);
  pinia._s.set(id, store); // 将store和id映射起来

  // 可以操作store的所有属性
  Object.defineProperty(store, "$state", {
    get: () => pinia.state.value[id],
    set: (state) => $patch((oldState) => Object.assign(oldState, state)),
  });
  // 每个store创建的时候都会 应用一下插件
  pinia._p.forEach((plugin) =>
    Object.assign(store, plugin({ $id: id, store, pinia, app: pinia._a }))
  ); // 插件是可以返回对象的，会合并在store上
  return store;
}
function createOptionsStore(
  id: string,
  options: { [key: string]: any },
  pinia: any
) {
  let { state, getters, actions } = options;

  function setup() {
    // 这里会对用户传递的，state，actions,getters做处理
    pinia.state.value[id] = state ? state() : {};
    let localState = toRefs(pinia.state.value[id]);
    return Object.assign(
      localState, // 用户的状态
      actions, // 用户的动作
      // getters
      Object.keys(getters || {}).reduce((computedObject: any, name) => {
        // 处理计算属性
        computedObject[name] = computed(() => {
          let store = pinia._s.get(id);
          return getters[name].call(store, store);
        });
        return computedObject;
      }, {})
    );
  }

  const store = createSetupStore(id, setup, pinia, true);

  store.$reset = function () {
    //重置所有状态 只有options api才能使用
    let newState = state ? state() : {};
    store.$patch((state) => {
      Object.assign(state, newState);
    });
  };
  return store;
}

function isComputed(val: any) {
  return isRef(val) && (val as any).effect;
}

function isObject(val) {
  return typeof val === "object" && val !== null;
}
