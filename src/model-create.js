import assemble from './model-assemble.js';

/**
 * This is just a part of Model extracted for convenience
 * @param {Class} Model
 * @param {Object} schema
 * @returns {Class}
 */
const create = (Model, schema) => {
  // NOTE: encapsulated class definition makes it impossible to manipulate data schema from outside of the model
  class NewModel extends Model {
    constructor(data) {
      super();
      this.assemble(data);

      const proxy = new Proxy(this, {
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

      // eslint-disable-next-line no-constructor-return
      return proxy;
    }

    assemble(data) {
      assemble.call(this, NewModel, data, schema);
    }

    /**
     * @param {*} data
     * @returns {Object} - an object representing validation errors
     */
    static validate(data) {
      return assemble(NewModel, data, schema);
    }

    // static toGraphQL() {}
  }

  Object.freeze(NewModel);

  return NewModel;
};

export default create;
