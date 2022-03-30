import Model from '../src/model.js';

describe('Model', () => {
  const TestModel1 = new Model({
    title: String,
  });
  const TestModel2 = new Model({
    title: String,
    link: TestModel1,
  });

  test('correct value', () => {
    const instance1 = new TestModel1({
      title: 'TestModel1',
    });
    const instance2 = new TestModel2({
      title: 'TestModel1',
      link: instance1,
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
          link: instance3,
        });
      } catch (e) {
        error = e;
      }
      expect(error).toEqual(new Error('Invalid data'));
      expect(error.cause).toEqual(['Property "link": must be a specified model']);
    });
  });

  describe('same model', () => {
    const TestModel = new Model({
      title: String,
      'parent?': Model.SAME,
    });
    const instance1 = new TestModel({
      title: 'TestModel1',
    });
    test('correct value', () => {
      const instance2 = new TestModel({
        title: 'TestModel2',
        parent: instance1,
      });
      expect(instance1).toBeInstanceOf(TestModel);
      expect(instance2).toBeInstanceOf(TestModel);
    });
    test('incorrect value', () => {
      let error;
      try {
        const instance = new TestModel({
          title: 'TestModel2',
          parent: new TestModel1({
            title: 'TestModel1',
          }),
        });
      } catch (e) {
        error = e;
      }
      expect(error).toEqual(new Error('Invalid data'));
      expect(error.cause).toEqual(['Property "parent": must be a specified model']);
    });
  });

  describe('nested model', () => {
    const TestModel = new Model({
      title: String,
      options: {
        option1: String,
        flag: Boolean,
      },
    });
    test('correct value', () => {
      const instance1 = new TestModel({
        title: 'NestedModel',
        options: {
          option1: '12',
          flag: true,
        },
      });
      expect(instance1).toBeInstanceOf(TestModel);
      // expect(instance1.options).toBeInstanceOf(TestModel);
    });
  });
});
