
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