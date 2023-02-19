// const MODEL_PROPS = [Symbol.toPrimitive, Symbol.toStringTag, 'toJSON', 'toString', 'constructor'];

/**
 * @param {Map} propMap
 */
export default (data, propMap) =>
  new Proxy(data, {
    get(...args) {
      const key = args[1];
      if (propMap.has(key)) {
        return propMap.get(key);
      }
      return Reflect.get(...args);
    },
    has(...args) {
      const key = args[1];
      return Reflect.has(...args) || propMap.has(key);
    },
    ownKeys() {
      return [...propMap.keys()];
    },
    getOwnPropertyDescriptor(...args) {
      const key = args[1];
      if (propMap.has(key))
        return {
          writable: false,
          enumerable: true,
          configurable: true,
        };
      return Reflect.getOwnPropertyDescriptor(...args);
    },
    set() {
      return false;
    },
    deleteProperty() {
      return false;
    },
    defineProperty() {
      return false;
    },
  });
