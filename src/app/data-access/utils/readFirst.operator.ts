/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

export type Selector<T extends unknown> = (state: any) => T;

const NOOP: Selector<any> = (s: any) => s;

/**
 * Quick util to read 1st value emitted from BehaviorSubject/replay streams
 */
export function readFirst<T extends unknown>(source: Observable<any>, selector?: Selector<T>): T {
  let result: T = '' as T;
  source?.pipe(first(), map(selector || NOOP)).subscribe((v) => (result = v));
  return result;
}

/**
 * For streams that will emit asynhronously
 */
export async function readFirstAsync<T extends unknown>(source: Observable<any>, selector?: Selector<T>): Promise<T> {
  let result: T = await source?.pipe(first(), map(selector || NOOP)).toPromise();
  return result;
}
