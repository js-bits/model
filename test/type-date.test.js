import Model from '../src/model/model.js';

describe('Date', () => {
  const TestModel = new Model({
    date: Date,
    'optional?': Date,
  });

  test('correct value', () => {
    const instance = new TestModel({
      date: new Date(),
    });
    expect(instance).toBeInstanceOf(TestModel);
    expect(instance).toBeInstanceOf(Model);
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      expect(() => {
        new TestModel({
          date: new Model(),
          optional: new Date(),
        });
      }).toThrowError('Data is not valid');
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          date: null,
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
        date: new Date(),
        optional: 123,
      });
    }).toThrowError('Data is not valid');
  });
});
