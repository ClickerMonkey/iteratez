
import { Iterate } from './Iterate';


/**
 * The callback which is invoked for each item in the Iterate. The callback
 * can call [[Iterate.stop]] at anytime to stop iteration.
 *
 * @param item The item found in the iterator.
 * @param iterator The iterator with the item.
 * @returns The result of the callback.
 */
export type IterateCallback<T, K, S, R> = (item: T, key: K, iterator: Iterate<T, K, S>) => R;

/**
 * An [[Iterate]] source which handles iterating over items and calls
 * [[Iterate.act]] for each item, taking the requested action when possible.
 *
 * @param callback The function to invoke for each item.
 * @param iterator The iterator to check for early exists.
 */
export type IterateSource<T, K, S> = (iterator: Iterate<T, K, S>) => any;

/**
 * A where to apply duration iteration to only look at certain items when this
 * function returns `true`.
 *
 * @param item The item being iterated.
 * @returns `true` if the item should be iterated, otherwise `false`.
 */
export type IterateFilter<T, K> = (item: T, key?: K) => any;

/**
 * Tests two items for equality.
 * 
 * @param a The first item.
 * @param b The second item.
 * @returns `true` if the items are considered equal.
 */
export type IterateEquals<T, K> = (a: T, b: T, aKey?: K, bKey?: K) => boolean;

/**
 * Compares two items.
 * - if `a` < `b` then a negative number should be returned.
 * - if `a` > `b` then a positive number should be returned.
 * - if `a` = `b` then zero should be returned.
 * 
 * @param a The first item.
 * @param b The second item.
 * @returns A number representing which item is greater.
 */
export type IterateCompare<T, K> = (a: T, b: T, aKey?: K, bKey?: K) => number;


/**
 * A function that looks at the source and if it can provide an iterator
 * it returns one. Otherwise false is returned.
 * 
 * @param source The source to test.
 */
export type IterateGenerator<T, K, S> = (source: any) => Iterate<T, K, S> | false;

/**
 * A type which takes a source and returns a result from a function.
 */
export type IterateFunction<T, R, A extends any[], K, S> = 
  [S] extends [any]
    ? (source: IterateSourceTypeKey<T, K, S>, ...args: A) => R
    : (source: S, ...args: A) => R;

/**
 * A function which performs a function on a subject and possibly applies a result.
 */
export type IterateFunctionExecute<T, R, A extends any[], K, S> = 
  [R] extends [void]
    ? (subject: Iterate<T, K, S>) => any 
    : [A] extends []
      ? (subject: Iterate<T, K, S>, setResult: (result: R) => any) => any
      : (subject: Iterate<T, K, S>, setResult: (result: R) => any, ...args: A) => any;

/**
 * A function for handling a result of an operation.
 */
export type IterateResult<T> = (result: T) => any;

/**
 * A type which has an entries() function that returns an IterableIterator.
 */
export interface HasEntries<T, K> 
{ 
  entries(): IterableIterator<[K, T]>
}

/**
 * Any of the valid sources natively supported.
 * 
 * You can add to these types by overriding the definitions. See the README.
 */
export type IterateSourceType<T> =
  Iterate<T, any, any> |
  T[] |
  Set<T> |
  Map<any, T> | 
  Iterable<T> |
  HasEntries<T, any> |
  { [key: string]: T } |
  null |
  undefined |
  T;

/**
 * Any of the valid sources natively supported with specific keys.
 * 
 * You can add to these types by overriding the definitions. See the README.
 */
export type IterateSourceTypeKey<T, K, S = any> =
  Iterate<T, K, S> |
  (K extends number ? T[] : never) |
  (K extends T ? Set<T> : never) | 
  Map<K, T> |
  (K extends number ? Iterable<T> : never) |
  HasEntries<T, K> |
  (K extends string ? { [key: string]: T } : never ) |
  null | 
  undefined |
  (K extends number ? T : never);

/**
 * Given a source, attempt to get its stype.
 */
export type GetValueFor<S> = 
  (S extends Array<infer T> ? T : never) | 
  (S extends Iterate<infer T, infer K, S> ? T : never) |
  (S extends Set<infer T> ? T : never) |
  (S extends Map<infer K, infer T> ? T : never) |
  (S extends Iterable<infer T> ? T : never) |
  (S extends HasEntries<infer T, infer K> ? T : never) |
  (S extends { [key: string]: infer T } ? T : never);

/**
 * Given a source, attempt to get its key.
 */
export type GetKeyFor<S> = 
  (S extends Iterate<infer T, infer K, S> ? K : never) |
  (S extends Array<infer T> ? number : never) | 
  (S extends Set<infer T> ? T : never) |
  (S extends Map<infer K, infer T> ? K : never) |
  (S extends Iterable<infer T> ? number : never) |
  (S extends HasEntries<infer T, infer K> ? K : never) |
  (S extends { [key: string]: infer T } ? string : never) |
  number;

