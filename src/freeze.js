export default data =>
  new Proxy(data, {
    get(...args) {
      const [target, prop] = args;
      const allowedProps = [Symbol.toPrimitive, Symbol.toStringTag, 'toJSON', 'toString', 'constructor'];
      if (!Object.prototype.hasOwnProperty.call(target, prop) && !allowedProps.includes(prop)) {
        throw new Error(`Property "${String(prop)}" of a Model instance is not accessible`);
      }
      return Reflect.get(...args);
    },
    set(target, prop) {
      throw new Error(`Property assignment is not supported for "${String(prop)}"`);
    },
  });
