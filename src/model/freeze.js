import { hasOwn } from '../data-type/data-type-definition.js';

// const MODEL_PROPS = [Symbol.toPrimitive, Symbol.toStringTag, 'toJSON', 'toString', 'constructor'];
const ARRAY_MEMBERS = ['length', 'forEach'];
const REDIRECT_MEMBERS = [Symbol.iterator];

/**
 * @param {Map} propMap
 */
export default model =>
  new Proxy(model, {
    get(...args) {
      const key = args[1];
      // console.log('get', key);
      // if (hasOwn(data, key) || ARRAY_MEMBERS.includes(key) || REDIRECT_MEMBERS.includes(key)) {
      //   return data[key];
      // }
      return Reflect.get(...args);
    },
    // has(...args) {
    //   const key = args[1];
    //   // console.log('has', key);
    //   return Reflect.has(...args) || hasOwn(data, key);
    // },
    // ownKeys() {
    //   return Object.keys(data);
    // },
    // getOwnPropertyDescriptor(...args) {
    //   const key = args[1];
    //   // console.log('getOwnPropertyDescriptor', key);
    //   if (hasOwn(data, key))
    //     return {
    //       writable: false,
    //       enumerable: true,
    //       configurable: true,
    //     };
    //   return Reflect.getOwnPropertyDescriptor(...args);
    // },
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
