import validate from './model-validate.js';

const create = (schema, flags, Model) => {
  // NOTE: encapsulated class definition makes it impossible to manipulate data schema from outside of the model
  class NewModel extends Model {
    constructor(data) {
      super();
      // data type conversion goes here
      const errors = NewModel.validate(data);
      if (errors) {
        const error = new Error('Invalid data');
        error.name = Model.InvalidDataError;
        error.cause = errors; // TODO: replace with native https://v8.dev/features/error-cause;
        throw error;
      }
    }

    /**
     * @param {*} data
     * @returns {Object} - an object representing validation errors
     */
    static validate(data) {
      return validate(data, schema, flags[0], Model);
    }
  }

  return NewModel;
};

export default create;
