// eslint-disable-next-line import/no-extraneous-dependencies
import { jest } from '@jest/globals';

global.console = { log: jest.fn() };

describe('Example 1', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('Example 1', async () =>
    import('./example1.js').then(() => {
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log.mock.calls[0]).toEqual(['[object Model]']);
      expect(console.log.mock.calls[1]).toEqual([
        JSON.stringify(
          {
            firstName: 'Trygve',
            lastName: 'Reenskaug',
            yearBorn: 1930,
            verified: null,
          },
          null,
          '  '
        ),
      ]);
    }));
});
