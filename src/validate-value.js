import DataType from './data-type.js';

const validateValue = (type, value, isOptional) => {
  // console.log('validate', propName, type, value);
  if (typeof value === 'undefined' || value === null) {
    if (!isOptional) {
      return `Required field is not defined`;
    }
  } else {
    const errorMessage = DataType.validate(type, value);
    if (errorMessage) {
      return errorMessage;
    }
  }
};

export default validateValue;
