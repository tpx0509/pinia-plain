export function mapState(useStore, keysOrMapper) {
  return Array.isArray(keysOrMapper)
    ? // 如果是数组，统一成对象的格式
      keysOrMapper.reduce((reduced, key) => {
        reduced[key] = function () {
          return useStore()[key];
        };
        // 最终都是给computed使用的要返回函数
        /*
            xxx : () => useStore()[key]
        */
        return reduced;
      }, {})
    : // 如果是对象，就通过key对应的value去store中取值
      Object.keys(keysOrMapper).reduce((reduced, key) => {
        reduced[key] = function () {
          let store = useStore();
          let storeKey = keysOrMapper[key];
          return store[storeKey];
        };
        return reduced;
      }, {});
}
// 不仅能读，还能写
export function matWritableState(useStore, keysOrMapper) {
  return Array.isArray(keysOrMapper)
    ? // 如果是数组，统一成对象的格式
      keysOrMapper.reduce((reduced, key) => {
        reduced[key] = {
          get() {
            console.log('get',useStore(),key)
            return useStore()[key];
          },
          set(value) {
            useStore()[key] = value;
          }
        }
        // 利用了computed的另一种写法 get和set
        /*
            xxx : {
                get() => useStore()[key]
                set(val) => useStore()[key] = val
            } 
        */
        return reduced;
      }, {})
    : // 如果是对象，就通过key对应的value去store中取值
      Object.keys(keysOrMapper).reduce((reduced, key) => {
        reduced[key] = {
          get() {
            let store = useStore();
            let storeKey = keysOrMapper[key];
            return store[storeKey];
          },
          set(value) {
            let store = useStore();
            let storeKey = keysOrMapper[key];
            store[storeKey] = value;
          },
        };
        return reduced;
      }, {});
}

export function mapActions(useStore, keysOrMapper) {
  return Array.isArray(keysOrMapper)
    ? // 如果是数组，统一成对象的格式
      keysOrMapper.reduce((reduced, key) => {
        reduced[key] = function (...args) {
          return useStore()[key](...args);
        };
        return reduced;
      }, {})
    : // 如果是对象，就通过key对应的value去store中取值
      Object.keys(keysOrMapper).reduce((reduced, key) => {
        reduced[key] = function (...args) {
          let store = useStore();
          let storeKey = keysOrMapper[key];
          return store[storeKey](...args);
        };
        return reduced;
      }, {});
}
