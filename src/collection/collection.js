/* eslint-disable max-classes-per-file */
import DataType from '../data-type/data-type.js';
import Model, { MODELS } from '../model/model.js';
import Schema from '../model/schema.js';
import freeze from '../model/freeze.js';
import shortcut from './collection-shortcut.js';

const Options = new Model({
  'min?': Number,
  'max?': Number,
});

// const INDEX = Symbol('INDEX');

// const Model1 = new Model({
//   values: [new Union(Number, String, null)], // multiple types ( Number | String | null )
// });

class Collection extends Model {
  static toString() {
    return '[class Collection]';
  }

  static [Symbol.hasInstance](instance) {
    return super[Symbol.hasInstance](instance) && Array.isArray(instance);
  }

  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'Collection';
  }

  constructor(...args) {
    super();
    // eslint-disable-next-line no-constructor-return
    if (!arguments.length) return this; // prototype is being created

    const CustomCollection = this.create(...args);
    MODELS.add(CustomCollection);

    // eslint-disable-next-line no-constructor-return
    return CustomCollection;
  }

  // eslint-disable-next-line class-methods-use-this
  create(type, config = {}) {
    const ContentType = Schema.initType(type);
    const options = new Options(config);

    class CustomCollection extends Array {
      static toString() {
        return Collection.toString();
      }

      // eslint-disable-next-line class-methods-use-this
      get [Symbol.toStringTag]() {
        return 'Collection';
      }

      toString() {
        return `[object ${this[Symbol.toStringTag]}]`;
      }

      constructor(data) {
        DataType.assert(Array, data, '<collection_data>');
        DataType.assert(CustomCollection, data);

        super(...data.map(item => DataType.fromJSON(ContentType, item)));

        // eslint-disable-next-line no-constructor-return
        return freeze(this);
      }

      // static toGraphQL() {}
    }

    new DataType(
      {
        /**
         * @param {Array} value
         */
        validate(value, parent) {
          if (value instanceof CustomCollection) return undefined;
          if (!DataType.is(Array, value)) return 'invalid collection type';

          const validationResult = [];
          const parentName = parent ? `${parent}.` : '';

          value.forEach((item, index) => {
            const errors = DataType.validate(ContentType, item, `${parentName}[${index}]`);
            if (errors) validationResult.push(...errors);
          });

          const { min = 0, max } = options;
          if (min === max && value.length !== options.max) {
            validationResult.push(`"${parentName}size" must be ${max}`);
          } else if (value.length > max) {
            validationResult.push(`"${parentName}size" must be less then or equal to ${max}`);
          } else if (value.length < min) {
            validationResult.push(`"${parentName}size" must be equal to or more then ${min}`);
          }

          const hasErrors = validationResult.length;
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
