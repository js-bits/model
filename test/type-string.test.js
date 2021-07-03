import Model from '../src/model.js';

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
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      expect(() => {
        new TestModel({
          string: 123,
        });
      }).toThrowError('Invalid data');
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          string: null,
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
        string: '123',
        optional: 123,
      });
    }).toThrowError('Invalid data');
  });
});
