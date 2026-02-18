import { describe, test, expect, vi } from 'vitest';
import { withDatabaseRetry } from '../../src/storage/database';

describe('withDatabaseRetry', () => {
  test('retries once on SQLITE_READONLY_DBMOVED and succeeds', () => {
    let calls = 0;
    const fn = vi.fn(() => {
      calls += 1;
      if (calls === 1) {
        const err: any = new Error('moved');
        err.code = 'SQLITE_READONLY_DBMOVED';
        throw err;
      }
      return 'ok';
    });

    const result = withDatabaseRetry((db: any) => fn());
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('throws non-retryable errors immediately', () => {
    const err: any = new Error('other');
    err.code = 'SQLITE_BUSY';
    const fn = () => { throw err; };
    expect(() => withDatabaseRetry((db: any) => fn())).toThrow(err);
  });
});
