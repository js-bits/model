import Model from '../src/model/model.js';

describe('String', () => {
  const TestModel = new Model({
    string: String,
    'optional?': String,
  });

  test('correct value', () => {
    const instance = new TestModel({
      string: '',
    });
    expect(instance).toBeInstanceOf(TestModel);
    expect(instance).toBeInstanceOf(Model);
    expect(instance.string).toEqual('');
    expect(instance.optional).toBeNull();
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      expect(() => {
        new TestModel({
          string: 123,
        });
      }).toThrowError('Data is not valid');
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          string: null,
        });
      }).toThrowError('Data is not valid');
      expect(() => {
        new TestModel({});
      }).toThrowError('Data is not valid');
    });
  });

  test('incorrect optional value', () => {
    expect(() => {
      new TestModel({
        string: '123',
        optional: 123,
      });
    }).toThrowError('Data is not valid');
  });
});
