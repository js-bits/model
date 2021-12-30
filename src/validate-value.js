import DATA_TYPES from './data-types.js';

const validateValue = (type, value, isOptional) => {
  // console.log('validate', propName, type, value);
  if (typeof value === 'undefined' || value === null) {
    if (!isOptional) {
      return `Required field is not defined`;
    }
  } else if (DATA_TYPES.has(type)) {
    const errorMessage = DATA_TYPES.get(type)(value);
    if (errorMessage) {
      return errorMessage;
    }
  }
  // else if (Model.isModel(type)) {
  //   if (!(value instanceof type)) {
  //     return `Invalid value type`;
  //   }
  // }
};

export default validateValue;
