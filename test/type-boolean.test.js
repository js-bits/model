import Model from '../src/model.js';

describe('Boolean', () => {
  const TestModel = new Model({
    boolean: Boolean,
    'optional?': Boolean,
  });

  test('correct value', () => {
    const instance = new TestModel({
      boolean: false,
    });
    expect(instance).toBeInstanceOf(TestModel);
    expect(instance).toBeInstanceOf(Model);
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      expect(() => {
        new TestModel({
          boolean: 123,
        });
      }).toThrowError('Data is invalid');
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          boolean: null,
        });
      }).toThrowError('Data is invalid');
      expect(() => {
        new TestModel({});
      }).toThrowError('Data is invalid');
    });
  });

  test('incorrect optional value', () => {
    expect(() => {
      new TestModel({
        boolean: false,
        optional: 123,
      });
    }).toThrowError('Data is invalid');
  });
});
