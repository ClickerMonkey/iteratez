import { Iterate } from './Iterate';
import { IterateCompare, IterateEquals, IterateGenerator } from './types';


/**
 * An array of iterate generators. These are checked in order. If you wish to 
 * add your own you should do:
 * 
 * `Generators.unshift(s => isSourceLogic ? createIterate : false)`
 */
export const Generators: IterateGenerator<any, any, any>[] = [
  (s) => s instanceof Iterate ? s : false,
  (s) => Array.isArray(s) ? Iterate.array(s) : false,
  (s) => s instanceof Set ? Iterate.set(s) : false,
  (s) => s instanceof Map ? Iterate.map(s) : false,
  (s) => s && s[Symbol.iterator] ? Iterate.iterable(s) : false,
  (s) => s && s.entries ? Iterate.hasEntries(s) : false,
  (s) => s === undefined || s === null ? Iterate.empty() : false,
  (s) => typeof s === 'object' ? Iterate.object(s) : false,
  (s) => Iterate.array([s])
];

/**
 * A function which is given a value and finds the best way to iterate over it.
 * 
 * If you wish to add your own iterater to be supported you should add it to
 * the begging of [[Generators]]. You can then add a custom definition for this
 * function in your project so the overloaded function definition is available.
 * 
 * @param s The source to get an iterator for.
 */
export function iterate<T, K, S> (iterate: Iterate<T, K, S>): Iterate<T, K, S>
export function iterate<T> (array: T[]): Iterate<T, number, T[]>
export function iterate<T> (set: Set<T>): Iterate<T, T, Set<T>>
export function iterate<T, K> (map: Map<K, T>): Iterate<T, K, Map<K, T>>
export function iterate (str: string): Iterate<string, number, string>
export function iterate<T, I extends Iterable<T>> (iterable: I): Iterate<T, number, I>
export function iterate<T, K, E extends { entries(): IterableIterator<[K, T]> }> (hasEntries: E): Iterate<T, K, E>
export function iterate<T> (object: { [key: string]: T} ): Iterate<T, string, { [key: string]: T}>
export function iterate<T> (empty?: null): Iterate<any, any, any>
export function iterate<T> (item: T): Iterate<T, number, [T]>
export function iterate<T, K, S> (s: any): Iterate<T, K, S>
{
  for (const generator of Generators)
  {
    const generated = generator(s);

    if (generated !== false)
    {
      return generated;
    }
  }
}


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
export function compare<T, K> (ascending: boolean, nullsFirst: boolean, a: any, b: any, correctType: (x: any) => any, comparator: IterateCompare<T, K>): number
{
  const typeA = !correctType(a);
  const typeB = !correctType(b);

  if (typeA !== typeB) 
  {
    // One is invalid
    return (nullsFirst ? typeA : typeB) ? -1 : 1;
  } 
  else if (typeA) 
  {
    // Both are invalid
    return 0;
  }

  // Neither are invalid
  return ascending ? comparator(a, b) : comparator(b, a);
}

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
export function equals<T, K> (a: any, b: any, correctType: (x: any) => any, equality: IterateEquals<T, K>): boolean
{
  const typeA = !correctType(a);
  const typeB = !correctType(b);

  if (typeA !== typeB) 
  {
    // One is invalid
    return false;
  } 
  else if (typeA) 
  {
    // Both are invalid
    return true;
  }

  // Neither are invalid
  return equality(a, b);
}

/**
 * Creates a number comparator.
 * 
 */
export function getNumberComparator<K> (ascending: boolean = true, nullsFirst: boolean = false): IterateCompare<number, K>
{
  const isType = (x: any) => typeof x === 'number' && isFinite(x);
  const comparator: IterateCompare<number, K> = (a, b) => a - b;

  return (a, b) => compare<number, K>(ascending, nullsFirst, a, b, isType, comparator);
}

/**
 * Creates a string comparator.
 * 
 * @param sensitive If equality logic should be case sensitive.
 * @param ascending If the strings should be in ascending order.
 * @param nullsFirst If non-strings values should be ordered first.
 */
export function getStringComparator<K> (sensitive: boolean = true, ascending: boolean = true, nullsFirst: boolean = false): IterateCompare<string, K>
{
  const isType = (x: any) => typeof x === 'string';
  const comparator: IterateCompare<string, K> = sensitive
    ? (a, b) => a.localeCompare(b)
    : (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())

  return (a, b) => compare<string, K>(ascending, nullsFirst, a, b, isType, comparator);
}

/**
 * Creates a date comparator.
 * 
 * @param ascending If the dates should be in ascending order (oldest first).
 * @param nullsFirst If non-date values should be ordered first.
 */
export function getDateComparator<K> (ascending: boolean = true, nullsFirst: boolean = false): IterateCompare<Date, K>
{
  const isType = (x: any) => x instanceof Date;
  const comparator: IterateCompare<Date, K> = (a, b) => a.getTime() - b.getTime();

  return (a, b) => compare<Date, K>(ascending, nullsFirst, a, b, isType, comparator);
}

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
export function getDateEquality<K> (equalityTimespan: number = 1, utc: boolean = true): IterateEquals<Date, K>
{
  const MILLIS_IN_MINUTE = 60000;

  const isType = (x: any) => x instanceof Date;
  const getTime = utc
    ? (a: Date) => a.getTime()
    : (a: Date) => a.getTime() + a.getTimezoneOffset() * MILLIS_IN_MINUTE;
  const equality: IterateEquals<Date, K> = (a, b) => (getTime(a) % equalityTimespan) === (getTime(b) % equalityTimespan);

  return (a, b) => equals<Date, K>(a, b, isType, equality);
}

/**
 * Determines whether the given variable is a function.
 */
export function isFunction(x: any): x is (...args: any[]) => any
{
  return typeof x === 'function';
}