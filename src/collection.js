/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import Model from './model.js';
import Schema from './schema.js';
import shortcut from './collection-shortcut.js';

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate`
  Type
  options
`;

const Options = new Model({
  'min?': Number,
  'max?': Number,
});

const INDEX = Symbol('INDEX');

// const Model1 = new Model({
//   values: [new Union(Number, String, null)], // multiple types ( Number | String | null )
// });

class Collection extends Model {
  static toString() {
    return '[class Collection]';
  }

  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'Collection';
  }

  constructor(type, options = {}) {
    super();

    this[ø.Type] = Schema.initType(type);
    this[ø.options] = new Options(options);

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

  // add(item) {
  //   if (item instanceof this.Model) {
  //     // test
  //   }
  //   return this;
  // }

  // get(id) {
  //   return this[ø.data].get(id);
  // }

  // delete(id) {
  //   this[ø.data].delete(id);
  //   return this;
  // }
}

Schema.add(Array, rawType => {
  const { type, ...options } = shortcut(rawType);
  return new Collection(type, options);
});

export default Collection;
