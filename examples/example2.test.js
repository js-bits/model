// eslint-disable-next-line import/no-extraneous-dependencies
import { jest } from '@jest/globals';

describe('Examples', () => {
  beforeEach(() => {
    global.console = { log: jest.fn() };
  });
  afterEach(() => {
    jest.resetModules();
  });

  test('Example 2', done => {
    import('./example2.js').then(() => {
      expect(console.log).toHaveBeenCalledTimes(10);
      expect(console.log.mock.calls[0]).toEqual(['Invalid data']);
      expect(console.log.mock.calls[1]).toEqual([{ balance: 'must be a number' }]);
      expect(console.log.mock.calls[2]).toEqual(['Invalid data']);
      expect(console.log.mock.calls[3]).toEqual([{ title: 'required property is not defined' }]);
      expect(console.log.mock.calls[4]).toEqual(['Invalid data']);
      expect(console.log.mock.calls[5]).toEqual([
        {
          account: 'invalid model type',
          category: 'must be a model',
          date: 'required property is not defined',
        },
      ]);
      expect(console.log.mock.calls[6]).toEqual([
        JSON.stringify(
          [
            {
              title: 'Checking Account',
              balance: 123.56,
              limit: null,
            },
            {
              title: 'Credit Card',
              balance: -876.32,
              limit: 1000,
            },
          ],
          null,
          '  '
        ),
      ]);
      expect(console.log.mock.calls[7]).toEqual([
        JSON.stringify(
          {
            parent: null,
            exclude: null,
            title: 'Food',
          },
          null,
          '  '
        ),
      ]);
      expect(console.log.mock.calls[8]).toEqual([new Date('10/09/2010'), 'Dining', 'Checking Account']);
      expect(console.log.mock.calls[9]).toEqual([123.56]);
      done();
    });
  });
});
