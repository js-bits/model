/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import Model, { Schema as BaseSchema } from './model.js';

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate`
  ContentModel
  data
  options
`;

const Options = new Model({
  'min?': Number,
  'max?': Number,
});

const INDEX = Symbol('INDEX');

// const Model1 = new Model({
//   numbers: [Number], // auto create new Collection(Number) // { min: undefined, max: undefined }
//   // eslint-disable-next-line no-sparse-arrays
//   numbers2: [Number, { min: 1, max: 10 }], // new Collection(Number, { min: 1, max: 10 })
//   // eslint-disable-next-line no-sparse-arrays
//   numbers5: [Number, , , ,], // new Collection(Number, { min: undefined, max: 4 })
//   values: [Number, String, null], // multiple types
// });

class Collection extends Model {
  static toString() {
    return '[class Collection]';
  }

  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'Collection';
  }

  constructor(ContentType, options = {}) {
    super({
      type: ContentType,
    });
    // if (Model.isModel(Type)) {
    //   this.Model = Type;
    // } else {
    //   this.Model = new Model(Type);
    // }
    // this[ø.data] = new Map();
    /* this[ø.options] = */ new Options(options);
    console.log(this, options);
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

class CollectionSchema extends BaseSchema {
  initType(propType) {
    console.log('CollectonSchema');
    if (Array.isArray(propType)) {
      const [contentType, ...rest] = propType;
      let options;
      if (propType.length > 1) {
        [options] = rest;
        if (options === undefined) {
          if (rest.every(item => item === undefined)) {
            options = {
              max: propType.length,
            };
          }
        }
      }

      return new Collection(contentType, options);
    }
    return super.initType(propType);
  }
}

BaseSchema.setGlobalSchema(CollectionSchema);

new Collection(Number);

const Field = new Model({
  name: String,
  type: String,
  value: String,
});

new Model({
  // eslint-disable-next-line no-sparse-arrays
  fields: [Field],
});

new Model({
  // eslint-disable-next-line no-sparse-arrays
  fields: [Field, , , ,],
});

new Model({
  // eslint-disable-next-line no-sparse-arrays
  fields: [
    Field,
    {
      min: 1,
      max: 2,
      // id: 'UUID',
    },
  ],
});

// new NumberCollection([1, 2, 3, 4]);

// new NumberCollection({
//   'uuid-uuid': { name: '', value: '' },
//   ...
// });

export default Collection;
