import Model from '../src/model/model.js';

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
      expect(instance1 instanceof TestModel1).toBe(true);
      expect(instance1 instanceof Model).toBe(true);
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
      expect(error).toEqual(new Error('Data is not valid'));
      expect(error.cause).toEqual(['"model": must be a model']);
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
        expect.assertions(2);
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
        } catch (error) {
          expect(error).toEqual(new Error('Data is not valid'));
          expect(error.cause).toEqual(['"link": invalid model type']);
        }
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
        expect.assertions(2);
        try {
          const instance = new TestModel({
            title: 'TestModel2',
            parent: new TestModel1({
              title: 'TestModel1',
            }),
          });
        } catch (error) {
          expect(error).toEqual(new Error('Data is not valid'));
          expect(error.cause).toEqual(['"parent": invalid model type']);
        }
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
              unknown: null,
            },
          });
        } catch (e) {
          error = e;
        }
        expect(error).toEqual(new Error('Data is not valid'));
        expect(error.cause).toEqual([
          '"options.param": must be a string',
          '"options.flag": must be a boolean',
          '"options.unknown": property is not defined in schema',
        ]);
      });
    });

    describe('multiple nested models', () => {
      const TestModel = new Model({
        title: String,
        options: {
          flag: Boolean,
          settings: {
            'optional?': String,
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
        expect(instance1.options.settings.json.any.value).toEqual('is valid');
        expect(instance1.options.settings.optional).toBeNull();
        expect(JSON.stringify(instance1)).toEqual(
          '{"title":"NestedModel","options":{"flag":true,"settings":{"optional":null,"param":123,"json":{"any":{"value":"is valid"}}}}}'
        );
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
        expect(error).toEqual(new Error('Data is not valid'));
        expect(error.cause).toEqual([
          '"title": must be a string',
          '"options.flag": required property is not defined',
          '"options.settings.param": must be a number',
          '"options.settings.json": must be a plain object',
          '"options.unknown": property is not defined in schema',
        ]);
      });
    });
  });
});
