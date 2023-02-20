import Model from '../src/model/model.js';

describe('Number', () => {
  const TestModel = new Model({
    number: Number,
    'optional?': Number,
  });

  test('correct value', () => {
    const instance = new TestModel({
      number: 0,
    });
    expect(instance).toBeInstanceOf(TestModel);
    expect(instance).toBeInstanceOf(Model);
    expect(instance.number).toEqual(0);
    expect(instance.optional).toBeNull();
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      expect(() => {
        new TestModel({
          number: '',
        });
      }).toThrowError('Data is not valid');
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          number: null,
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
        number: 234,
        optional: '234',
      });
    }).toThrowError('Data is not valid');
  });
});
