import { hasOwn } from '../data-type/data-type-definition.js';

// const MODEL_PROPS = [Symbol.toPrimitive, Symbol.toStringTag, 'toJSON', 'toString', 'constructor'];
const ARRAY_MEMBERS = ['length', 'forEach'];

/**
 * @param {Map} propMap
 */
export default (model, data) =>
  new Proxy(model, {
    get(...args) {
      const key = args[1];
      if (hasOwn(data, key) || ARRAY_MEMBERS.includes(key)) {
        return data[key];
      }
      return Reflect.get(...args);
    },
    has(...args) {
      const key = args[1];
      return Reflect.has(...args) || hasOwn(data, key);
    },
    ownKeys() {
      return Object.keys(data);
    },
    getOwnPropertyDescriptor(...args) {
      const key = args[1];
      if (hasOwn(data, key))
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
