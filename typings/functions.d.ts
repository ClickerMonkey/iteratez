import { Iterate } from './Iterate';
import { IterateCompare, IterateEquals, IterateGenerator } from './types';
/**
 * An array of iterate generators. These are checked in order. If you wish to
 * add your own you should do:
 *
 * `Generators.unshift(s => isSourceLogic ? createIterate : false)`
 */
export declare const Generators: IterateGenerator<any, any, any>[];
/**
 * A function which is given a value and finds the best way to iterate over it.
 *
 * If you wish to add your own iterater to be supported you should add it to
 * the begging of [[Generators]]. You can then add a custom definition for this
 * function in your project so the overloaded function definition is available.
 *
 * @param s The source to get an iterator for.
 */
export declare function iterate<T, K, S>(iterate: Iterate<T, K, S>): Iterate<T, K, S>;
export declare function iterate<T>(array: T[]): Iterate<T, number, T[]>;
export declare function iterate<T>(set: Set<T>): Iterate<T, T, Set<T>>;
export declare function iterate<T, K>(map: Map<K, T>): Iterate<T, K, Map<K, T>>;
export declare function iterate(str: string): Iterate<string, number, string>;
export declare function iterate<T, I extends Iterable<T>>(iterable: I): Iterate<T, number, I>;
export declare function iterate<T, K, E extends {
    entries(): IterableIterator<[K, T]>;
}>(hasEntries: E): Iterate<T, K, E>;
export declare function iterate<T>(object: {
    [key: string]: T;
}): Iterate<T, string, {
    [key: string]: T;
}>;
export declare function iterate<T>(empty?: null): Iterate<any, any, any>;
export declare function iterate<T>(item: T): Iterate<T, number, [T]>;
/**
 * A helper comparison function for two unknown variables. If they both
 * aren't the correct type the are considered equal. If one doesn't have the
 * correct type then the `nullsFirst` variable is used to determine which
 * value goes first. If both variables are valid the the given `compare`
 * function is used taking into account the `ascending` order option.
 *
 * @param ascending If valid values should be in ascending order (default).
 * @param nullsFirst If invalid values should be ordered first.
 * @param a The first value.
 * @param b The second value.
 * @param correctType Verifies whether a value is valid.
 * @param compare Compares two valid values.
 */
export declare function compare<T, K>(ascending: boolean, nullsFirst: boolean, a: any, b: any, correctType: (x: any) => any, comparator: IterateCompare<T, K>): number;
/**
 * A helper equals function for two unknown variables. If they both aren't
 * the correct type they are considered equal. If one doesn't have the
 * correct type they are considered unequal. If they both are valid then
 * the given equality logic is used.
 *
 * @param a The first value.
 * @param b The second value.
 * @param correctType Verifies whether a value is valid.
 * @param equals Compares two valid values for equality.
 */
export declare function equals<T, K>(a: any, b: any, correctType: (x: any) => any, equality: IterateEquals<T, K>): boolean;
/**
 * Creates a number comparator.
 *
 */
export declare function getNumberComparator<K>(ascending?: boolean, nullsFirst?: boolean): IterateCompare<number, K>;
/**
 * Creates a string comparator.
 *
 * @param sensitive If equality logic should be case sensitive.
 * @param ascending If the strings should be in ascending order.
 * @param nullsFirst If non-strings values should be ordered first.
 */
export declare function getStringComparator<K>(sensitive?: boolean, ascending?: boolean, nullsFirst?: boolean): IterateCompare<string, K>;
/**
 * Creates a date comparator.
 *
 * @param ascending If the dates should be in ascending order (oldest first).
 * @param nullsFirst If non-date values should be ordered first.
 */
export declare function getDateComparator<K>(ascending?: boolean, nullsFirst?: boolean): IterateCompare<Date, K>;
/**
 * Creates a date equality function.
 *
 * @param equalityTimespan This defines which timespan to dates can lie on
 *    to be considered equal. By default they have to have the same
 *    millisecond. If you want dates equal by the following timespans use
 *    these values: Second = 1000, Minute = 60000, Hour = 3600000,
 *    Day = 86400000, Week = 604800000 (approx)
 * @param utc If when comparing timespans, if we should look at their UTC
 *    date/time OR if they should be changed to their relative times based
 *    on their timezone.
 */
export declare function getDateEquality<K>(equalityTimespan?: number, utc?: boolean): IterateEquals<Date, K>;
/**
 * Determines whether the given variable is a function.
 */
export declare function isFunction(x: any): x is (...args: any[]) => any;
