import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import ø from './protected.js';

const TERMS = new Set();

// TERMS.add((propName, propType) => {
//   if (propType === Model.SAME) return NewModel;
// });

// TERMS.add((propName, propType) => {
//   if (enumerate.isEnum(propType)) {
//     DataType.add(propType, value => {
//       const allowedValues = Object.values(propType);
//       const list = allowedValues.map(item => String(item)).join(',');
//       return allowedValues.includes(value) ? undefined : `must be one of allowed values [${list}]`;
//     });
//     return propType;
//   }
// });

// TERMS.add((propName, propType) => {
//   // nested schema
//   if (DataType.is(JSON, propType)) return new Model(propType);
// });

// eslint-disable-next-line import/prefer-default-export
export function processKey(Schema, schema, key) {
  if (!schema[ø.required]) {
    schema[ø.required] = {
      [ø.isRequired](name) {
        return schema[ø.required][name] === !schema[ø.required][ø.requiredFlag];
      },
    };
    schema[ø.isRequired] = name => schema[ø.required][name] === !schema[ø.required][ø.requiredFlag];
  }

  let specifier;
  let propName = key;
  const globalFlag = schema[ø.required][ø.requiredFlag];
  const match = key.match(/^(.+)([?!])$/);
  if (match) {
    [, propName, specifier] = match;
    if (globalFlag !== undefined && specifier !== (globalFlag ? '!' : '?')) {
      const error = new Error('Model schema is invalid. Must contain either ? or ! specifiers');
      error.name = Schema.InvalidModelSchemaError;
      throw error;
    }
    schema[ø.required][ø.requiredFlag] = specifier === '!';
  }
  schema[ø.required][propName] = !specifier;

  return propName;
}
