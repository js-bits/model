import Model from '../src/model.js';

describe('Model', () => {
  const TestModel1 = new Model({
    title: String,
  });
  const TestModel2 = new Model({
    title: String,
    parent: TestModel1,
  });

  test('correct value', () => {
    const instance1 = new TestModel1({
      title: 'TestModel1',
    });
    const instance2 = new TestModel2({
      title: 'TestModel1',
      parent: instance1,
    });
    expect(instance2).toBeInstanceOf(TestModel2);
    expect(instance2).toBeInstanceOf(Model);
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      let error;
      try {
        const TestModel3 = new Model({
          title: String,
        });
        const instance3 = new TestModel3({
          title: 'TestModel3',
        });
        const instance2 = new TestModel2({
          title: 'TestModel1',
          parent: instance3,
        });
      } catch (e) {
        error = e;
      }
      expect(error).toEqual(new Error('Invalid data'));
      expect(error.cause).toEqual(['Field "parent": Invalid value type']);
    });
  });
});
