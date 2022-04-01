import Model from '../src/model.js';

describe('Model', () => {
  describe('should accept base model as a data type', () => {
    const TestModel1 = new Model({
      test: String,
    });
    const TestModel2 = new Model({
      model: Model,
    });
    const TestModel3 = new Model({
      model: Model,
    });

    test('correct value', () => {
      const instance1 = new TestModel1({
        test: 'Model',
      });
      const instance2 = new TestModel2({
        model: instance1,
      });
      const instance3 = new TestModel3({
        model: instance2,
      });
      expect(instance1 instanceof TestModel1).toBeTruthy();
      expect(instance1 instanceof Model).toBeTruthy();
      expect(instance2).toBeInstanceOf(TestModel2);
      expect(instance2).toBeInstanceOf(Model);
      expect(instance3).toBeInstanceOf(TestModel3);
      expect(instance3).toBeInstanceOf(Model);
    });

    test('incorrect value', () => {
      let error;
      try {
        const instance = new TestModel3({
          model: {},
        });
      } catch (e) {
        error = e;
      }
      expect(error).toEqual(new Error('Invalid data'));
      expect(error.cause).toEqual({ model: 'must be a model' });
    });
  });

  describe('derived models', () => {
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
        expect(error.cause).toEqual({ link: 'must be a specified model' });
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
      test('correct value with plain object', () => {
        const instance2 = new TestModel({
          title: 'TestModel2',
          parent: {
            title: 'TestModel1',
          },
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
        expect(error.cause).toEqual({ parent: 'must be a specified model' });
      });
    });

    describe('nested model', () => {
      const TestModel = new Model({
        title: String,
        options: {
          param: String,
          flag: Boolean,
        },
      });
      test('correct value', () => {
        const instance1 = new TestModel({
          title: 'NestedModel',
          options: {
            param: '12',
            flag: true,
          },
        });
        expect(instance1).toBeInstanceOf(TestModel);
        // expect(instance1.options).toBeInstanceOf(TestModel);
      });
      test('incorrect value', () => {
        let error;
        try {
          const instance1 = new TestModel({
            title: 'NestedModel',
            options: {
              param: 123,
              flag: '',
              unknown: '',
            },
          });
        } catch (e) {
          error = e;
        }
        expect(error).toEqual(new Error('Invalid data'));
        expect(error.cause).toEqual({
          options: {
            flag: 'must be a boolean',
            param: 'must be a string',
            unknown: 'property is not defined in schema',
          },
        });
      });
    });

    describe('multiple nested models', () => {
      const TestModel = new Model({
        title: String,
        options: {
          flag: Boolean,
          settings: {
            param: Number,
            json: JSON,
          },
        },
      });

      test('correct value', () => {
        const instance1 = new TestModel({
          title: 'NestedModel',
          options: {
            flag: true,
            settings: {
              param: 123,
              json: {
                any: {
                  value: 'is valid',
                },
              },
            },
          },
        });
        expect(instance1).toBeInstanceOf(TestModel);
        // expect(instance1.options).toBeInstanceOf(TestModel);
      });
      test('incorrect value', () => {
        let error;
        try {
          const instance1 = new TestModel({
            title: 123,
            options: {
              unknown: '',
              settings: {
                param: '',
                json: String,
              },
            },
          });
        } catch (e) {
          error = e;
        }
        expect(error).toEqual(new Error('Invalid data'));
        expect(error.cause).toEqual({
          title: 'must be a string',
          options: {
            flag: 'required property is not defined',
            unknown: 'property is not defined in schema',
            settings: {
              param: 'must be a number',
              json: 'must be a plain object',
            },
          },
        });
      });
    });
  });
});
