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
      }).toThrowError('Invalid data');
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          boolean: null,
        });
      }).toThrowError('Invalid data');
      expect(() => {
        new TestModel({});
      }).toThrowError('Invalid data');
    });
  });

  test('incorrect optional value', () => {
    expect(() => {
      new TestModel({
        boolean: false,
        optional: 123,
      });
    }).toThrowError('Invalid data');
  });
});
