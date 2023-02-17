// eslint-disable-next-line import/no-extraneous-dependencies
import { jest } from '@jest/globals';

jest.spyOn(global.console, 'log');
// eslint-disable-next-line import/first
import example from './example1.js';

describe('Examples', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('Example 1', () => {
    example();
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
  });
});
