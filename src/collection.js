/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import Model from './model.js';
import Schema from './schema.js';
import shortcut from './collection-shortcut.js';

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

  constructor(type, config = {}) {
    super();
    // eslint-disable-next-line no-constructor-return
    if (!arguments.length) return this; // prototype is being created

    const ContentType = Schema.initType(type);
    const options = new Options(config);

    class CustomCollection extends Collection {
      constructor(data) {
        super();
        if (!DataType.is(Array, data)) {
          const error = new Error('Model data must be a array'); // TODO: fix message dupes
          error.name = Model.InvalidDataError;
          throw error;
        }

        DataType.assert(CustomCollection, data);

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

      // static toGraphQL() {}
    }

    new DataType(
      {
        /**
         * @param {Array} value
         */
        validate(value) {
          if (value instanceof CustomCollection) return undefined;
          if (!DataType.is(Array, value)) return 'invalid collection type';

          const validationResult = {};

          value.forEach((item, index) => {
            const error = DataType.validate(ContentType, item);
            if (error) {
              validationResult[index] = error;
            }
          });

          if (options.max && value.length > options.max) {
            validationResult.size = `must be less then or equal to ${options.max}`;
          } else if (options.min && value.length < options.min) {
            validationResult.size = `must be equal to or more then ${options.min}`;
          }

          const hasErrors = Object.keys(validationResult).length;
          return hasErrors ? validationResult : undefined;
        },
        fromJSON(value) {
          if (DataType.is(Array, value)) return new CustomCollection(value);
          return value;
        },
        toJSON(value) {
          return value.toJSON();
        },
      },
      CustomCollection
    );

    // eslint-disable-next-line no-constructor-return
    return CustomCollection;
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
