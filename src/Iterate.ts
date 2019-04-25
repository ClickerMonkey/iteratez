import { defaultCompare, getDateComparator, getDateEquality, getNumberComparator, getStringComparator, isFunction, iterate } from './functions';
import { IterateAction } from "./IterateAction";
import { GetKeyFor, GetValueFor, HasEntries, IterateCallback, IterateCompare, IterateEquals, IterateFilter, IterateFunction, IterateFunctionExecute, IterateReset, IterateResult, IterateSource, IterateSourceType, IterateSourceTypeKey } from "./types";


/**
 * A class that allows an iteratable source to be iterated any number of times.
 *
 * There are 3 types of functions in an Iterate:
 * - **Operation**: produces a result from the values in the iterator.
 * - **View**: produces a new iterator, the original iterator is not affected.
 * - **Mutation**: modifies the source based on the values in the current iterator.
 * 
 * The **View** functions do not iterate over the source, the iterator they
 * return does not iterate over the source until an **Operation** or 
 * **Mutation** function are called on it.
 * 
 * **Operations**
 * - `empty`: Determines whether the view contains no values.
 * - `has`: Determines whether the view contains any values.
 * - `contains`: Determines if the view contains a specific value.
 * - `first`: Gets the first value in the view.
 * - `last`: Gets the last value in the view.
 * - `count`: Counds the number of values in the view.
 * - `array`: Builds an array of the values in the view.
 * - `set`: Builds a Set of the values in the view.
 * - `object`: Builds an object of the values in the view.
 * - `entries`: Builds an array of `[key, value]` in the view.
 * - `map`: Builds a Map of the values and keys in the view.
 * - `group`: Builds an object of value arrays grouped by a value derived from each value.
 * - `reduce`: Reduces the values in the view down to a single value.
 * - `min`: Returns the minimum value in the view.
 * - `max`: Returns the maximum value in the view.
 * - `each`: Invokes a function for each value in the view.
 * - `copy`: Copies the values in the view and returns a new iterator.
 * - `changes`: Notifies you when values are added, removed, or still present on an iterator since the last time called.
 * 
 * **Mutations**
 * - `delete`: Removes values in the view from the source.
 * - `overwrite`: Replaces values in the view from the source.
 * - `extract`: Removes values in the view from the source and returns a new iterator with the removed values.
 * 
 * **Views**
 * Returns an iterator...
 * - `where`: for a subset of the values.
 * - `not`: for a subset of the values (opposite of where).
 * - `transform`: that transforms the values to another type.
 * - `reverse`: that iterates over the values in reverse order.
 * - `exclude`: that excludes values found in another iterator.
 * - `intersect`: that has common values in another iterator.
 * - `sorted`: that is sorted based on some comparison.
 * - `shuffle`: that is randomly ordered.
 * - `unique`: that has only unique values.
 * - `duplicates`: that has all the duplicate values.
 * - `readonly`: that ignores mutations.
 * - `keys`: only for the keys of the values (replace not supported).
 * - `values`: only for the values of the values (new key is index based).
 * - `take`: that only iterates over the first X values.
 * - `skip`: that skips the first X values.
 * - `drop`: that drops off the last X values.
 * - `append`: that is the original iterator + one or more iterators specified.
 * - `prepend`: that is one or more iterators specified + the original iterator.
 * - `gt`: that only has values greater than a value.
 * - `gte`: that only has values greater than or equal to a value.
 * - `lt`: that only has values less than a value.
 * - `lte`: that only has values less than or equal to a value.
 * - `fork`: that is this, but allows a function to perform fork operations
 * - `split`: Splits the values into two iterators (pass/fail) based on a condition.
 * - `unzip`: Splits the view into two iterates (keys/values).
 * 
 * The following functions are used to control comparison logic
 * 
 * - `numbers`: Set number comparison logic to the iterator.
 * - `strings`: Set string comparison logic to the iterator.
 * - `dates`: Set date comparison logic to the iterator.
 * - `desc`: Reverses the comparison logic.
 * - `withEquality`: Set a custom equality function.
 * - `withComparator`: Set a custom comparison function.
 * 
 * The following function lets you change the source.
 * 
 * - `reset`: Specify a new source to iterate over.
 * 
 * The following static functions exist to help iterate simple sources:
 *
 * - `array`: Iterates an array.
 * - `object`: Iterates the properties of an object, optionally just the properties explicitly set on the object.
 * - `tree`: Iterates trees.
 * - `linked`: Iterates linked-lists.
 * - `map`: Iterates Maps
 * - `set`: Iterates Sets
 * - `hasEntries`: Iterates any object which has the `entries()` iterator.
 * - `empty`: Iterates nothing.
 * - `iterable`: Iterates any collection that implements iterable.
 * - `join`: Returns an iterator that iterates over one or more iterators.
 * - `entries`: Iterates an array of `[key, value]` entries.
 * - `zip`: Combines a key iterator and value iterator into one.
 *
 * @typeparam T The type of value being iterated.
 */
export class Iterate<T, K, S>
{

  /**
   * A result of the iteration passed to [[Iterate.stop]].
   */
  public result: any = null;

  /**
   * The last action (if any) called on this iterator.
   */
  public action: IterateAction;

  /**
   * The value to replace with the current value.
   */
  public replaceWith: T;

  /**
   * The current callback passed to the iterator.
   */
  public callback: IterateCallback<T, K, S, any>;

  /**
   * The source of iterable values. This allows the iteration over any type of
   * structure. The source must call the callback for each value and its
   * recommended that the source checks the [[Iterate.iterating]] flag after
   * each callback invokation.
   */
  private source: IterateSource<T, K, S>;

  /**
   * The equality checker to use for this iterator and subsequent views.
   */
  private equality: IterateEquals<T, K>;

  /**
   * The comparator to use for this iterator and subsequent views.
   */
  private comparator: IterateCompare<T, K>;

  /**
   * The function to invoke to passing a new source for iteration.
   */
  private handleReset: IterateReset<S>;

  /**
   * Creates a new Iterate given a source.
   *
   * @param source The source of values to iterator.
   */
  public constructor (source: IterateSource<T, K, S>, parent?: Iterate<T, any, any>)
  {
    this.source = source;

    if (parent)
    {
      this.equality = parent.equality;
      this.comparator = parent.comparator;
    }
  }

  /**
   * The function which receives a new source to reset iteration.
   * 
   * @package handleReset The function which takes the new source.
   */
  public onReset (handleReset: IterateReset<S>): this
  {
    this.handleReset = handleReset;

    return this;
  }

  /**
   * Returns whether the iterator at this point supports a reset.
   */
  public canReset (): boolean
  {
    return !!this.handleReset;
  }

  /**
   * Sets a new source for iteration if supported. If the iterator doesn't 
   * support resetting the source then an error will be thrown when `strict` 
   * is true.
   * 
   * @param source The new source for iteration.
   * @param strict If an error should be thrown if the iterator can't be reset.
   */
  public reset (source: S, strict: boolean = true): this
  {
    if (this.handleReset)
    {
      this.handleReset(source);  
    } 
    else if (strict) 
    {
      throw new Error('This iterator does not support reset.');
    }

    return this;
  }

  /**
   * Returns a clone of this iterator with the same source. This is necessary
   * if you want to iterate all or a portion of the source while already
   * iterating it (like a nested loop).
   */
  public clone (): Iterate<T, K, S>
  {
    return new Iterate<T, K, S>( this.source, this );
  }

  /**
   * Passes the given value to the iterator callback and returns the action
   * requested at this point in iteration.
   *
   * @param value The current value being iterated.
   */
  public act (value: T, key: K): IterateAction
  {
    this.action = IterateAction.CONTINUE;
    this.replaceWith = null;

    this.callback( value, key, this );

    return this.action;
  }

  /**
   * Stops iteration and optionally sets the result of the iteration.
   *
   * @param result The result of the iteration.
   */
  public stop (result?: any): this
  {
    this.result = result;
    this.action = IterateAction.STOP;

    return this;
  }

  /**
   * Returns whether iteration was stopped by the user.
   */
  public isStopped (): boolean
  {
    return this.action === IterateAction.STOP;
  }

  /**
   * Stops iteration and optionally sets the result of the iteration.
   *
   * @param result The result of the iteration.
   */
  public replace (replaceWith: T): this
  {
    this.replaceWith = replaceWith;
    this.action = IterateAction.REPLACE;

    return this;
  }

  /**
   * Signals to the iterator source that the current value wants to be removed.
   */
  public remove (): this
  {
    this.action = IterateAction.REMOVE;

    return this;
  }

  /**
   * Sets the equality logic for this iterator and subsequent views.
   * 
   * @param equality A function to compare two values for equality.
   */
  public withEquality (equality: IterateEquals<T, K>): this
  {
    this.equality = equality;

    return this;
  }

  /**
   * Sets the comparison logic for this iterator and subsequent views. If this
   * iterator does not have an equality check, this will also use the 
   * comparator for the equality logic.
   * 
   * @param comparator A function which compares tow values.
   */
  public withComparator (comparator: IterateCompare<T, K>): this
  {
    this.comparator = comparator;

    if (!this.equality)
    {
      this.equality = (a, b) => comparator(a, b) === 0;
    }

    return this;
  }

  /**
   * Applies the logic to the iterator.
   * 
   * @param comparator The comparison logic.
   * @param equality The equality logic if the comparison logic won't suffice.
   */
  private withLogic<A> (comparator: IterateCompare<A, K>, equality?: IterateEquals<A, K>): this
  {
    this.comparator = comparator as unknown as IterateCompare<T, K>;
    this.equality = (equality || ((a: A, b: A, aKey: K, bKey: K) => comparator(a, b, aKey, bKey) === 0)) as unknown as IterateEquals<T, K>;

    return this;
  }

  /**
   * Applies number equality and comparison logic to this iterator and 
   * subsequent ones.
   * 
   * @param ascending If the numbers should be in ascending order.
   * @param nullsFirst If non-number values should be ordered first.
   */
  public numbers (ascending: boolean = true, nullsFirst: boolean = false): this
  {
    return this.withLogic(getNumberComparator(ascending, nullsFirst));
  }

  /**
   * Applies string equality and comparison logic to this iterator and 
   * subsequent ones.
   * 
   * @param sensitive If equality logic should be case sensitive.
   * @param ascending If the strings should be in ascending order.
   * @param nullsFirst If non-strings values should be ordered first.
   */
  public strings (sensitive: boolean = true, ascending: boolean = true, nullsFirst: boolean = false): this
  {
    return this.withLogic(getStringComparator(sensitive, ascending, nullsFirst));
  }

  /**
   * Applies date equality and comparison logic to this iterator and 
   * subsequent ones.
   * 
   * @param equalityTimespan This defines which timespan to dates can lie on 
   *    to be considered equal. By default they have to have the same 
   *    millisecond. If you want dates equal by the following timespans use 
   *    these values: Second = 1000, Minute = 60000, Hour = 3600000,
   *    Day = 86400000, Week = 604800000 (approx)
   * @param utc If when comparing timespans, if we should look at their UTC 
   *    date/time OR if they should be changed to their relative times based 
   *    on their timezone.
   * @param ascending If the dates should be in ascending order (oldest first).
   * @param nullsFirst If non-date values should be ordered first.
   */
  public dates (equalityTimespan: number = 1, utc: boolean = true, ascending: boolean = true, nullsFirst: boolean = false): this
  {
    return this.withLogic(getDateComparator(ascending, nullsFirst), getDateEquality(equalityTimespan, utc));
  }

  /**
   * Reverses the comparator on this iterator and subsequent views. If this
   * iterator does not have a comparator this has no affect.
   * 
   * @param comparator An override for any existing comparison logic.
   */
  public desc (comparator?: IterateCompare<T, K>): this
  {
    const compare = comparator || this.comparator;

    this.comparator = (a, b, aKey, bKey) => compare(b, a, bKey, aKey);

    return this;
  }

  /**
   * Gets the equality logic desired, optionally overriding the one specified
   * on this iterator.
   * 
   * @param equalityOverride Equality logic to use if provided.
   */
  public getEquality (equalityOverride?: IterateEquals<T, K>): IterateEquals<T, K>
  {
    return equalityOverride || this.equality || ((a, b) => defaultCompare(a, b, true) === 0);
  }

  /**
   * Gets the comparison logic desired, optionally overriding the one specified
   * on this iterator. If one cannot be determined an error is thrown.
   * 
   * @param comparatorOverride Comparison logic to use if provided.
   */
  public getComparator (comparatorOverride?: IterateCompare<T, K>): IterateCompare<T, K>
  {
    return comparatorOverride || this.comparator || ((a, b) => defaultCompare(a, b, false));
  }

  /**
   * An operation that determines whether this iterator is empty.
   *
   * @param setResult A function to pass the result to.
   */
  public empty (): boolean
  public empty (setResult: IterateResult<boolean>): this
  public empty (setResult?: IterateResult<boolean>): boolean | this
  {
    const result = !this.each((value, key, iterator) => iterator.stop()).isStopped();

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that determines whether this iterator has a value. 
   *
   * @param setResult A function to pass the result to.
   */
  public has (): boolean
  public has (setResult: IterateResult<boolean>): this
  public has (setResult?: IterateResult<boolean>): boolean | this
  {
    const result = this.each((value, key, iterator) => iterator.stop()).isStopped();

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that determines whether this iterator has the given value.
   * 
   * @param value The value to search for.
   * @param setResult A function to pass the result to.
   */
  public contains (value: T): boolean
  public contains (value: T, setResult: IterateResult<boolean>): this
  public contains (value: T, setResult?: IterateResult<boolean>): boolean | this
  {
    const equality = this.getEquality();
    const result = this.where((other, otherKey) => equality(other, value, otherKey)).has();

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that counts the number of values in the iterator.
   *
   * @param setResult A function to pass the count to.
   */
  public count (): number
  public count (setResult: IterateResult<number>): this
  public count (setResult?: IterateResult<number>): number | this
  {
    let result: number = 0;

    this.each(() => result++);

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that returns the first value in the iterator. 
   *
   * @param setResult A function to pass the first value to.
   */
  public first (): T
  public first (setResult: IterateResult<T>): this
  public first (setResult?: IterateResult<T>): T | this
  {
    const result = this.each((value, key, iterator) => iterator.stop(value)).result;

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that returns the last value in the iterator.
   *
   * @param setResult A function to pass the last value to.
   */
  public last (): T
  public last (setResult: IterateResult<T>): this
  public last (setResult?: IterateResult<T>): T | this
  {
    let result: T = null;

    this.each(value => result = value);

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that builds an array of values from the source.
   *
   * @param out The array to place the values in.
   * @param setResult A function to pass the array to.
   */
  public array (out?: T[]): T[]
  public array (out: T[], setResult: IterateResult<T[]>): this
  public array (setResult: IterateResult<T[]>): this
  public array (outOrResult: T[] | IterateResult<T[]> = [], onResult?: IterateResult<T[]>): T[] | this
  {
    const result = isFunction(outOrResult) ? [] : outOrResult;
    const setResult = isFunction(outOrResult) ? outOrResult : onResult;

    this.each(value => result.push( value ));

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that builds an array of [key, value] entries from this view.
   *
   * @param out The array to place the entries in.
   * @param setResult A function to pass the entries to.
   */
  public entries (out?: Array<[K, T]>): Array<[K, T]>
  public entries (out: Array<[K, T]>, setResult: IterateResult<Array<[K, T]>>): this
  public entries (setResult: IterateResult<Array<[K, T]>>): this
  public entries (outOrResult: Array<[K, T]> | IterateResult<Array<[K, T]>> = [], onResult?: IterateResult<Array<[K, T]>>): Array<[K, T]> | this
  {
    const result = isFunction(outOrResult) ? [] : outOrResult;
    const setResult = isFunction(outOrResult) ? outOrResult : onResult;

    this.each((value, key) => result.push([key, value]));

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that builds an object of values from the iterator keyed by a 
   * result returned by a `getKey` function.
   *
   * @param getKey The function which returns the key of the object.
   * @param out The object to place the values in.
   * @param setResult A function to pass the object to.
   */
  public object<O = { [key: string]: T }> (getKey: (value: T) => keyof O, out?: O): O
  public object<O = { [key: string]: T }> (getKey: (value: T) => keyof O, out: O, setResult: IterateResult<O>): this
  public object<O = { [key: string]: T }> (getKey: (value: T) => keyof O, setResult: IterateResult<O>): this
  public object<O = { [key: string]: T }> (getKey: (value: T) => keyof O, outOrResult: O | IterateResult<O> = Object.create(null), onResult?: IterateResult<O>): O | this
  {
    const result = isFunction(outOrResult) ? Object.create(null) : outOrResult;
    const setResult = isFunction(outOrResult) ? outOrResult : onResult;

    this.each(value => result[ getKey( value ) as string ] = value);

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that builds a Set of values from the source.
   *
   * @param out The Set to place the values in.
   * @param setResult A function to pass the set to.
   */
  public set (out?: Set<T>): Set<T>
  public set (out: Set<T>, setResult: IterateResult<Set<T>>): this
  public set (setResult: IterateResult<Set<T>>): this
  public set (outOrResult: Set<T> | IterateResult<Set<T>> = new Set(), onResult?: IterateResult<Set<T>>): Set<T> | this
  {
    const result = isFunction(outOrResult) ? new Set() : outOrResult;
    const setResult = isFunction(outOrResult) ? outOrResult : onResult;

    this.each(value => result.add( value ));

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that builds a Map of key-value pairs from the source.
   *
   * @param out The Map to place the values in.
   * @param setResult A function to pass the map to.
   */
  public map (out?: Map<K, T>): Map<K, T>
  public map (out: Map<K, T>, setResult: IterateResult<Map<K, T>>): this
  public map (setResult: IterateResult<Map<K, T>>): this
  public map (outOrResult: Map<K, T> | IterateResult<Map<K, T>> = new Map(), onResult?: IterateResult<Map<K, T>>): Map<K, T> | this
  {
    const result = isFunction(outOrResult) ? new Map() : outOrResult;
    const setResult = isFunction(outOrResult) ? outOrResult : onResult;

    this.each((value, key) => result.set(key, value));

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that returns an object with arrays of values where the 
   * property of the object is a key returned by a function.
   * 
   * @param by A function to get the key from a value.
   * @param out The object to add groups to.
   * @param setResult A function to pass the groups to.
   */
  public group<G extends { [by: string]: T[] }> (by: (value: T) => any, out?: G): G
  public group<G extends { [by: string]: T[] }> (by: (value: T) => any, out: G, setResult: IterateResult<G>): this
  public group<G extends { [by: string]: T[] }> (by: (value: T) => any, setResult: IterateResult<G>): this
  public group<G extends { [by: string]: T[] }> (by: (value: T) => any, outOrResult: G | IterateResult<G> = Object.create(null), onResult?: IterateResult<G>): G | this
  {
    const result = isFunction(outOrResult) ? Object.create(null) : outOrResult;
    const setResult = isFunction(outOrResult) ? outOrResult : onResult;

    this.each(value => 
    {
      const key = by(value);

      if (key in result) 
      {
        result[key].push(value);
      } 
      else 
      {
        result[key] = [value];
      }
    });

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that reduces all the values in the source to a single value 
   * given the initial value and a function to convert a value and the current 
   * reduced value
   * 
   * @param initial The initial value to pass to the `reducer` function the 
   *    first time.
   * @param reducer A function which takes a value in the iterator and the 
   *    current reduced value and returns a new reduced value.
   * @param setResult A function to pass the reduced value to.
   */
  public reduce<R> (initial: R, reducer: (value: T, reduced: R) => R): R
  public reduce<R> (initial: R, reducer: (value: T, reduced: R) => R, setResult: IterateResult<R>): this
  public reduce<R> (initial: R, reducer: (value: T, reduced: R) => R, setResult?: IterateResult<R>): R | this
  {
    let reduced: R = initial;

    this.each(value => reduced = reducer( value, reduced ));

    return setResult ? (setResult(reduced), this) : reduced;
  }

  /**
   * An operation that returns the minimum value in this iterator. If this 
   * iterator is empty null is returned.
   * 
   * @param setResult A function to pass the minimum value to.
   */
  public min (): T
  public min (setResult: IterateResult<T>): this
  public min (setResult?: IterateResult<T>): T | this
  {
    const compare = this.getComparator();
    const result = this.reduce<T>(null, (value, min) => min === null || compare(value, min) < 0 ? value : min);

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * An operation that returns the maximum value in this iterator. If this 
   * iterator is empty null is returned.
   * 
   * @param setResult A function to pass the maximum value to.
   */
  public max (): T
  public max (setResult: IterateResult<T>): this
  public max (setResult?: IterateResult<T>): T | this
  {
    const compare = this.getComparator();
    const result = this.reduce<T>(null, (value, max) => max === null || compare(value, max) > 0 ? value : max);

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * A map of key-value pairs stored from the last time `changes` was invoked.
   * 
   * The keys are the value in the iterator or a dynamically created value
   * returned by the `getIdentifier` function. If that function is provided
   * once it must always be provided to ensure correct change detection.
   */
  protected history: Map<any, [K, T]>;

  /**
   * An operation which determines which changes have occurred in the source 
   * since the last time the changes operation was called. The changes 
   * operation needs to be called on the same exact iterator instance to 
   * properly track changes. You should avoid sharing an iterator or using 
   * reset for an iterator that you're using to track changes.
   * 
   * Optionally you can provide a `getIdentifier` function which can convert
   * a value into a more optimal value for comparison. The value returned 
   * will be compared by reference so a scalar value (number, string, etc)
   * is ideal but other identifiers can be returned as long as they are
   * the same reference and not dynamically generated.
   * 
   * The first time this operation is performed all the values in the iterator
   * will be passed through the `onAdd` function.
   * 
   * The `onRemove` function is only called at the very end of the changes 
   * logic.
   * 
   * @param onAdd The function to invoke for each value added since the 
   *    last `changes` operation,
   * @param onRemove The function to invoke for each value removed since the
   *    last `changes` operation. This function is called zero or more times
   *    at the end of the changes logic.
   * @param onPresent The function to invoke for each value that was in the 
   *    iterator before and is still in the iterator.
   * @param getIdentifier A function to use to create a simpler way to identify
   *    a value. The simpler the value returned the better the performance 
   *    of the changes logic. If this function is passed once, it should be 
   *    passed everytime or the results of this function will not be accurate.
   */
  public changes (
    onAdd: IterateCallback<T, K, S, any>, 
    onRemove: IterateCallback<T, K, S, any>,
    onPresent: IterateCallback<T, K, S, any>,
    getIdentifier?: IterateCallback<T, K, S, any>): this
  {
    if (!this.history)
    {
      this.history = new Map<any, [K, T]>();
    }

    const notRemoved = new Map<any, [K, T]>(this.history);

    this.each((value, key, iterator) =>
    {
      const mapKey = getIdentifier ? getIdentifier(value, key, iterator) : value;

      if (this.history.has(mapKey))
      {
        onPresent(value, key, iterator);
      }
      else
      {
        onAdd(value, key, iterator);

        if (iterator.result !== IterateAction.REMOVE)
        {
          this.history.set(mapKey, [key, value]);
        }
      }

      notRemoved.delete(mapKey);
    });

    for (const [key, value] of notRemoved.values())
    {
      onRemove(value, key, this);
    }
    
    return this;
  }

  /**
   * A mutation which removes values in this iterator from the source.
   */
  public delete (): this
  {
    return this.each((value, key, iterator) => iterator.remove());
  }

  /**
   * A mutation which removes values in this iterator from the source and 
   * returns a new iterator with the removed values.
   */
  public extract (): Iterate<T, K, Array<[K, T]>>
  public extract (setResult: IterateResult<Iterate<T, K, Array<[K, T]>>>): this
  public extract (setResult?: IterateResult<Iterate<T, K, Array<[K, T]>>>): Iterate<T, K, Array<[K, T]>> | this
  {
    const extracted: Array<[K, T]> = [];

    this.each((value, key, iterator) => extracted.push([key, value]) && iterator.remove());

    const result = Iterate.entries(extracted);

    return setResult ? (setResult(result), this) : result;
  }

  /**
   * A mutation which replaces values in this view with a single given value.
   * 
   * @param replacement The value to replace for all the values in this iterator.
   */
  public overwrite (replacement: T): this
  {
    return this.each((value, key, iterator) => iterator.replace(replacement));
  }

  /**
   * A mutation which replaces values in this view with a dynamically created one.
   * 
   * @param updater A function which given a value and key returns a replacement value.
   */
  public update (updater: (value: T, key: K) => T): this
  {
    return this.each((value, key, iterator) => iterator.replace(updater(value, key)));
  }

  /**
   * Forks this view into another and returns a reference to this view.
   * This allows chaining of multiple views which each perform a different
   * operation or mutation. Forks are executed sequentially, so if one fork
   * performs mutations the subsequent forks will see the mutated values.
   * 
   * @param forker A function which takes the iterator at this point and 
   *    performs any mutations and operations.
   */
  public fork (forker: (fork: this) => any): this
  {
    forker(this);

    return this;
  }

  /**
   * Provides split views of the values in this iterator, one iterator gets
   * passed values and the other iterator gets the failed values.
   * 
   * You can pass a function as a second argument which recieves two iterators
   * for pass and fail respectively. This will be returned in that scenario.
   * 
   * If you don't pass a second function an object will be returned with two
   * properties: pass and fail.
   */
  public split (pass: IterateFilter<T, K>): { pass: Iterate<T, K, S>, fail: Iterate<T, K, S> };
  public split (pass: IterateFilter<T, K>, handle: (pass: Iterate<T, K, S>, fail: Iterate<T, K, S>) => any): this
  public split (by: IterateFilter<T, K>, handle?: (pass: Iterate<T, K, S>, fail: Iterate<T, K, S>) => any): any
  {
    const pass = this.where(by);
    const fail = this.not(by);

    if (handle)
    {
      handle(pass, fail);

      return this;
    }

    return { pass, fail };
  }

  /**
   * Unzips the view into a keys and values views.
   * 
   * You can pass a function as a second argument which recieves two iterators
   * for keys and values respectively. This will be returned in that scenario.
   * 
   * If you don't pass a second function an object will be returned with two
   * properties: keys and values.
   */
  public unzip (): { keys: Iterate<K, number, S>, values: Iterate<T, number, S> };
  public unzip (handle: (keys: Iterate<K, number, S>, values: Iterate<T, number, S>) => any): this
  public unzip (handle?: (keys: Iterate<K, number, S>, values: Iterate<T, number, S>) => any): any
  {
    const keys = this.keys();
    const values = this.values();
    
    if (handle)
    {
      handle(keys, values);

      return this;
    }

    return { keys, values };
  }

  /**
   * Returns a view of just the keys in this view. Any mutations done to the 
   * keys view affect the underlying source.
   */
  public keys (): Iterate<K, number, S>
  {
    return new Iterate<K, number, S>(next =>
    {
      let index = 0;

      this.each((value, key, prev) =>
      {
        switch (next.act( key, index++ ))
        {
          case IterateAction.STOP:
            prev.stop();
            break;
          case IterateAction.REMOVE:
            prev.remove();
            break;
          case IterateAction.REPLACE:
            // not supported
            break;
        }
      });
    }).onReset(this.handleReset);
  }

  /**
   * Returns a view of just the values in this view. Any mutations done to the 
   * values view affect the underlying source.
   */
  public values (): Iterate<T, number, S>
  {
    return new Iterate<T, number, S>(next =>
    {
      this.each((value, key, prev) =>
      {
        let index = 0;

        switch (next.act( value, index++ ))
        {
          case IterateAction.STOP:
            prev.stop();
            break;
          case IterateAction.REMOVE:
            prev.remove();
            break;
          case IterateAction.REPLACE:
            prev.replace( next.replaceWith );
            break;
        }
      });

    }, this).onReset(this.handleReset);
  }

  /**
   * Returns a view of this iterator. This allows other views to be more DRY.
   * 
   * @param getData Get any necessary data needed for the view.
   * @param shouldAct Based on the data and the value, should we act on it?
   * @param afterAct What to do if the value was acted on.
   * @param afterSkip What to do if the value was NOT acted on.
   */
  public view<D>(
    getData: () => D, 
    shouldAct: (data: D, value: T, key: K) => any, 
    afterAct?: (data: D, value: T, key: K, iter: Iterate<T, K, S>) => void, 
    afterSkip?: (data: D, value: T, key: K, iter: Iterate<T, K, S>) => void): Iterate<T, K, S>
  {
    return new Iterate<T, K, S>(next =>
    {
      const data = getData();

      this.each((value, key, prev) =>
      {
        if (shouldAct(data, value, key))
        {
          switch (next.act( value, key ))
          {
            case IterateAction.STOP:
              prev.stop();
              break;
            case IterateAction.REMOVE:
              prev.remove();
              break;
            case IterateAction.REPLACE:
              prev.replace( next.replaceWith );
              break;
          }

          if (afterAct)
          {
            afterAct(data, value, key, prev);
          }
        }
        else if (afterSkip)
        {
          afterSkip(data, value, key, prev);
        }
      });

    }, this).onReset(this.handleReset);
  }

  /**
   * Returns a view that only returns a maximum number of values.
   *
   * @param amount The maximum number of values to return.
   */
  public take (amount: number): Iterate<T, K, S>
  {
    if (amount <= 0)
    {
      return Iterate.empty();
    }

    return this.view<{ amount: number }>(
      () => ({ amount }),
      (data) => data.amount > 0,
      (data) => data.amount--,
      (data, value, key, iter) => iter.stop()
    );
  }

  /**
   * Returns a view that skips the given number of values from the values
   * in this iterator.
   *
   * @param amount The number of values to skip.
   */
  public skip (amount: number): Iterate<T, K, S>
  {
    return this.view<{ skipped: number }>(
      () => ({ skipped: 0 }),
      (data) => data.skipped >= amount,
      (data) => data.skipped++,
      (data) => data.skipped++
    );
  }

  /**
   * Returns a view that drops the given number of values from the end of the
   * values in this iterator.
   *
   * @param amount The number of values to drop from the end.
   */
  public drop (amount: number): Iterate<T, K, S>
  {
    return this.reverse().skip(amount).reverse();
  }

  /**
   * Returns a view thats values are the values in this iterator followed
   * by the values in the given iterators.
   *
   * @param iterators The iterators to append after this one.
   */
  public append (...sources: S[]): Iterate<T, K, S>;
  public append (...sources: IterateSourceTypeKey<T, K>[]): Iterate<T, K, any>;
  public append (...sources: IterateSourceType<T>[]): Iterate<T, any, any>;
  public append (...sources: IterateSourceType<any>[]): Iterate<any, any, any>;
  public append (...sources: any[]): Iterate<any, any, any>
  {
    return Iterate.join( this, ...sources ).onReset(this.handleReset);
  }

  /**
   * Returns a view thats values are the values in the given iterators
   * followed by the values in this iterator.
   *
   * @param iterators The iterators to prepend before this one.
   */
  public prepend (...sources: S[]): Iterate<T, K, S>;
  public prepend (...sources: IterateSourceTypeKey<T, K>[]): Iterate<T, K, any>;
  public prepend (...sources: IterateSourceType<T>[]): Iterate<T, any, any>;
  public prepend (...sources: IterateSourceType<any>[]): Iterate<any, any, any>;
  public prepend (...sources: any[]): Iterate<any, any, any>
  {
    return Iterate.join( ...sources, this ).onReset(this.handleReset);
  }

  /**
   * Returns a view of values in this iterator which pass a `where` function.
   *
   * @param where The function which determines if a value should be iterated.
   */
  public where (where: IterateFilter<T, K>): Iterate<T, K, S>
  {
    return this.view<null>(
      () => null,
      (data, value, key) => where(value, key)
    );
  }

  /**
   * Returns a view of values in this iterator which do NOT pass a `not` function.
   * 
   * @param not The function which determines if a value should be iterated.
   */
  public not (not: IterateFilter<T, K>): Iterate<T, K, S>
  {
    return this.view<null>(
      () => null,
      (data, value, key) => !not(value, key)
    );
  }

  /**
   * Returns a view where all values are greater than the given value.
   * If a comparator is not on this iterator or provided an error is thrown.
   * 
   * @param threshold The value to compare against.
   * @param comparator An override for any existing comparison logic.
   */
  public gt (threshold: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>
  {
    return this.view<IterateCompare<T, K>>(
      () => this.getComparator(comparator),
      (compare, value, key) => compare(value, threshold, key) > 0
    );
  }

  /**
   * Returns a view where all values are greater than or equal to the given value.
   * If a comparator is not on this iterator or provided an error is thrown.
   * 
   * @param threshold The value to compare against.
   * @param comparator An override for any existing comparison logic.
   */
  public gte (threshold: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>
  {
    return this.view<IterateCompare<T, K>>(
      () => this.getComparator(comparator),
      (compare, value, key) => compare(value, threshold, key) >= 0
    );
  }

  /**
   * Returns a view where all values are less than the given value.
   * If a comparator is not on this iterator or provided an error is thrown.
   * 
   * @param threshold The value to compare against.
   * @param comparator An override for any existing comparison logic.
   */
  public lt (threshold: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>
  {
    return this.view<IterateCompare<T, K>>(
      () => this.getComparator(comparator),
      (compare, value, key) => compare(value, threshold, key) < 0
    );
  }

  /**
   * Returns a view where all values are less than or equal to the given value.
   * If a comparator is not on this iterator or provided an error is thrown.
   * 
   * @param threshold The value to compare against.
   * @param comparator An override for any existing comparison logic.
   */
  public lte (threshold: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>
  {
    return this.view<IterateCompare<T, K>>(
      () => this.getComparator(comparator),
      (compare, value, key) => compare(value, threshold, key) <= 0
    );
  }

  /**
   * Returns a view of this iterator which does not include the values in the
   * given iterator.
   * 
   * @param source The source of values to exclude.
   * @param equality An override for any existing equality logic.
   */
  public exclude (source: IterateSourceType<T>, equality?: IterateEquals<T, any>): Iterate<T, K, S>;
  public exclude (source: any, equality?: IterateEquals<T, K>): Iterate<T, K, S>
  {
    return this.view<Iterate<T, any, any>>(
      () => iterate<T, K, S>(source).withEquality(this.getEquality(equality)),
      (values, value) => !values.contains(value)
    );
  }

  /**
   * Returns a view which has values which are in this iterator and the given
   * iterator.
   * 
   * @param source The source of values to intersect with.
   * @param equality An override for any existing equality logic.
   */
  public intersect (source: IterateSourceType<T>, equality?: IterateEquals<T, any>): Iterate<T, K, S>;
  public intersect (source: any, equality?: IterateEquals<T, K>): Iterate<T, K, S>
  {
    return this.view<Iterate<T, any, any>>(
      () => iterate<T, K, S>(source).withEquality(this.getEquality(equality)),
      (values, value) => values.contains(value)
    );
  }

  /**
   * Returns a view which only contains unique values.
   * 
   * @param equality An override for any existing equality logic.
   */
  public unique (equality?: IterateEquals<T, K>): Iterate<T, K, S>
  {
    return this.view<{ existing: Array<[K, T]>, isEqual: IterateEquals<T, K> }>(
      () => ({ existing: [], isEqual: this.getEquality(equality) }),
      ({existing, isEqual}, value, key) => existing.findIndex(([existKey, exist]) => isEqual(exist, value, existKey, key)) === -1,
      ({existing}, value, key) => existing.push([key, value])
    );
  }

  /**
   * Returns a view which only contains values that have duplicates in this 
   * iterator. For any values that occur more than twice you can exclude them
   * from the resulting view by passing `true` to `onlyOnce`.
   * 
   * @param onlyOnce If the view should contain unique or all duplicates.
   * @param equality An override for any existing equality logic.
   */
  public duplicates (onlyOnce: boolean = false, equality?: IterateEquals<T, K>): Iterate<T, K, S>
  { 
    return this.view<{ existing: Array<[K, T]>, once: boolean[], isEqual: IterateEquals<T, K> }>(
      () => ({ existing: [], once: [], isEqual: this.getEquality(equality) }),
      ({existing, once, isEqual}, value, key) =>  {
        const index = existing.findIndex(([existKey, exist]) => isEqual(exist, value, existKey, key));
        let act = index !== -1;

        if (act) {
          if (once[index] && onlyOnce) {
            act = false;
          }
          once[index] = true;
        } else {
          existing.push([key, value]);
        }

        return act;
      }
    );
  }

  /**
   * Returns a readonly view where mutations have no affect.
   */
  public readonly (): Iterate<T, K, S>
  {
    return new Iterate<T, K, S>(next =>
    {
      this.each((value, key, prev) =>
      {
        if (next.act( value, key ) === IterateAction.STOP)
        {
          prev.stop()
        }
      });

    }, this).onReset(this.handleReset);
  }

  /**
   * Returns a copy of the values in this view as a new iterator.
   */
  public copy (): Iterate<T, K, Array<[K, T]>>
  {
    return Iterate.entries(this.entries());
  }

  /**
   * Returns a view which requires a fully resolved array of values. The view 
   * must keep track of the original value index in order to ensure removals
   * and replaces can be performed on the source.
   * 
   * @param onResolve 
   */
  public viewResolved(onResolve: (values: Array<[K, T]>, handleAct: (value: T, key: K, index: number) => IterateAction) => void): Iterate<T, K, S>
  {
    return new Iterate<T, K, S>(next =>
    {
      const values: Array<[K, T]> = this.entries();
      const actions: IterateAction[] = [];
      const replaces: T[] = [];
      const original: T[] = [];

      let mutates: boolean = false;

      onResolve(values, (value, key, index) => 
      {
        const action = next.act(value, key);

        if (action === IterateAction.REPLACE || action === IterateAction.REMOVE)
        {
          mutates = true;
          original[ index ] = value;
          actions[ index ] = action;
          replaces[ index ] = next.replaceWith;
        }

        return action;
      });

      if (mutates)
      {
        let index: number = 0;

        this.each((value, key, modifyIterate) =>
        {
          switch (actions[ index ])
          {
            case IterateAction.REMOVE:
              if (value === original[index]) {
                modifyIterate.remove();
              }
              break;

            case IterateAction.REPLACE:
              if (value === original[index]) {
                modifyIterate.replace( replaces[ index ] );
              }
              break;
          }

          index++;
        });
      }

    }, this).onReset(this.handleReset);
  }

  /**
   * Returns a view which has the values sorted.
   * 
   * @param comparator An override for any existing comparison logic.
   */
  public sorted (comparator?: IterateCompare<T, K>): Iterate<T, K, S>
  {
    return this.viewResolved((values, handleAct) =>
    {
      const compare = this.getComparator(comparator);
      const mapped = values.map(([key, value], index) => ({ key, value, index }));

      mapped.sort((a, b) => compare(a.value, b.value));

      for (const {key, value, index} of mapped)
      {
        if (handleAct(value, key, index) === IterateAction.STOP)
        {
          return;
        }
      }
    });
  }

  /**
   * Returns an view of values in this iterator and presents them in a random order.
   */
  public shuffle (passes: number = 1): Iterate<T, K, S>
  {
    const swap = <X>(arr: X[], i: number, k: number) => {
      const t = arr[i];
      arr[i] = arr[k];
      arr[k] = t;
    }

    return this.viewResolved((values, handleAct) => 
    {
      const indices: number[] = [];
      const n = values.length;

      for (let i = 0; i < n; i++)
      {
        indices.push(i);
      }

      for (let pass = 0; pass < passes; pass++)
      {
        for (let k = 0; k < n; k++)
        {
          const j = Math.floor(Math.random() * n);
          swap(values, j, k);
          swap(indices, j, k);
        }
      }

      for (let i = 0; i < n; i++)
      {
        const [key, value] = values[i];

        if (handleAct(value, key, indices[i]) === IterateAction.STOP)
        {
          return;
        }
      }
    });
  }

  /**
   * Returns an view of values in this iterator and presents them in reverse.
   */
  public reverse (): Iterate<T, K, S>
  {
    return this.viewResolved((values, handleAct) => 
    {
      for (let i = values.length - 1; i >= 0; i--)
      {
        const [key, value] = values[i];

        if (handleAct(value, key, i) === IterateAction.STOP)
        {
          return;
        }
      }
    });
  }

  /**
   * Returns an iterator where this iterator is the source and the returned
   * iterator is built from transformed values pulled from values in the source
   * of this iterator. 
   *
   * @param transformer The function which transforms a value to another type.
   * @param untransformer The function which untransforms a value when replace is called.
   */
  public transform<W>(transformer: IterateCallback<T, K, S, W>,
    untransformer: (replaceWith: W, current: W, value: T, key: K) => T = null): Iterate<W, K, S>
  {
    return new Iterate<W, K, S>(next =>
    {
      this.each((prevItem, prevKey, prev) =>
      {
        const nextItem: W = transformer( prevItem, prevKey, prev );

        if (typeof nextItem !== 'undefined')
        {
          switch (next.act( nextItem, prevKey ))
          {
            case IterateAction.STOP:
              prev.stop();
              break;
            case IterateAction.REMOVE:
              prev.remove();
              break;
            case IterateAction.REPLACE:
              if (untransformer) {
                prev.replace( untransformer( next.replaceWith, nextItem, prevItem, prevKey ) );
              }
              break;
          }
        }
      });
    }).onReset(this.handleReset);
  }

  /**
   * Invokes the callback for each value in the source of this iterator. The
   * second argument in the callback is the reference to this iterator and
   * [[Iterate.stop]] can be called at anytime to cease iteration.
   *
   * @param callback The function to invoke for each value in this iterator.
   */
  public each (callback: IterateCallback<T, K, S, any>): this
  {
    this.result = undefined;
    this.callback = callback;
    this.action = IterateAction.CONTINUE;
    this.source( this );
    this.callback = null;

    return this;
  }

  /**
   * Passes the result of the iteration to the given function if a truthy
   * result was passed to [[Iterate.stop]].
   *
   * @param getResult The function to pass the result to if it exists.
   */
  public withResult (getResult: (result: any) => any): this
  {
    if (this.result)
    {
      getResult( this.result );
    }

    return this;
  }

  /**
   * This allows for...of loops to be used on this iterator.
   */
  [Symbol.iterator] (): Iterator<T>
  {
    return this.array().values();
  }

  /**
   * Returns an iterator for the given array.
   *
   * @param values The array of values to iterate.
   * @returns A new iterator for the given array.
   */
  public static entries<T, K> (values: Array<[K, T]> = []): Iterate<T, K, Array<[K, T]>>
  {
    return new Iterate<T, K, Array<[K, T]>>(iterator =>
    {
      for (let i = 0; i < values.length; i++)
      {
        const [key, value] = values[ i ];

        switch (iterator.act(value, key))
        {
          case IterateAction.STOP:
            return;
          case IterateAction.REMOVE:
            values.splice(i, 1);
            i--;
            break;
          case IterateAction.REPLACE:
            values.splice(i, 1, [key, iterator.replaceWith]);
            break;
        }
      }
    }).onReset(source => values = source);
  }

  /**
   * Returns an iterator for the given array.
   *
   * @param values The array of values to iterate.
   * @returns A new iterator for the given array.
   */
  public static array<T> (values: T[] = []): Iterate<T, number, T[]>
  {
    return new Iterate<T, number, T[]>(iterator =>
    {
      for (let i = 0; i < values.length; i++)
      {
        switch (iterator.act(values[ i ], i))
        {
          case IterateAction.STOP:
            return;
          case IterateAction.REMOVE:
            values.splice(i, 1);
            i--;
            break;
          case IterateAction.REPLACE:
            values.splice(i, 1, iterator.replaceWith);
            break;
        }
      }
    }).onReset(source => values = source);
  }

  /**
   * Returns an iterator for the keys and values specified. If the key and 
   * value iterators don't have the same number of values, the returned iterator
   * will have the maximum pairs possible (which is the lesser of the number
   * of keys and values).
   * 
   * If the returned iterator is mutated the given keys and values iterators 
   * will be mutated as well. If you want to avoid that, pass in readonly 
   * key/value iterators.
   * 
   * @param keys The iterator to obtain the keys from.
   * @param values The iterator to obtain the values from.
   */
  public static zip<J, K extends GetValueFor<J>, S, T extends GetValueFor<S>>(keySource: J, valueSource: S): Iterate<T, K, [J, S]>
  {
    let keyIterator = iterate(keySource) as unknown as Iterate<K, GetKeyFor<J>, J>;
    let valueIterator = iterate(valueSource) as unknown as Iterate<T, GetKeyFor<S>, S>;

    return new Iterate<T, K, [J, S]>(next =>
    {
      const keysArray = keyIterator.array();
      const removeKeyAt: number[] = [];
      let valuesIndex = 0;

      valueIterator.each((value, ignoreKey, prev) =>
      {
        if (valuesIndex >= keysArray.length)
        {
          prev.stop();
        }
        else
        {
          switch (next.act(value, keysArray[valuesIndex]))
          {
            case IterateAction.STOP:
              return;
            case IterateAction.REMOVE:
              prev.remove();
              removeKeyAt.push(valuesIndex);
              break;
            case IterateAction.REPLACE:
              prev.replace(next.replaceWith);
              break;
          }
        }
        
        valuesIndex++;
      });

      if (removeKeyAt.length > 0)
      {
        let keysIndex = 0;

        keyIterator.each((key, ignoreKey, prev) =>
        {
          if (keysIndex === removeKeyAt[0])
          {
            prev.remove();
            removeKeyAt.shift();
          }
          else if (removeKeyAt.length === 0)
          {
            prev.stop();
          }

          keysIndex++;
        });
      }
    }).onReset(([keys, values]: [J, S]) => 
    {
      keyIterator = iterate(keys) as unknown as Iterate<K, GetKeyFor<J>, J>;
      valueIterator = iterate(values) as unknown as Iterate<T, GetKeyFor<S>, S>;
    });
  }

  /**
   * Returns an iterator for any object which has an entries() iterable.
   * 
   * @param hasEntries The object with the entries() iterable.
   * @param onRemove The function that should handle removing a key/value.
   * @param onReplace The function that should handle replacing a value.
   */
  public static hasEntries<T, K, E extends HasEntries<T, K>> (
    hasEntries?: E, 
    onRemove?: (entries: E, key: K, value: T) => any, 
    onReplace?: (entries: E, key: K, value: T, newValue: T) => any): Iterate<T, K, E>
  {
    return new Iterate<T, K, E>(iterator =>
    {
      const iterable = hasEntries.entries();

      for (let next = iterable.next(); !next.done; next = iterable.next())
      {
        const [key, value] = next.value;

        switch (iterator.act(value, key))
        {
          case IterateAction.STOP:
            return;
          case IterateAction.REMOVE:
            if (onRemove) {
              onRemove(hasEntries, key, value);
            }
            break;
          case IterateAction.REPLACE:
            if (onReplace) {
              onReplace(hasEntries, key, value, iterator.replaceWith);
            }
            break;
        }
      }
    }).onReset(source => hasEntries = source);
  }

  /**
   * Returns an iterator for the given Map.
   *
   * @param values The Map of key-value pairs to iterate.
   * @returns A new iterator for the given Map.
   */
  public static map<T, K> (values: Map<K, T> = new Map<K, T>()): Iterate<T, K, Map<K, T>>
  {
    return Iterate.hasEntries<T, K, Map<K, T>>(
      values, 
      (map, key) => map.delete(key), 
      (map, key, value, newValue) => map.set(key, newValue)
    );
  }

  /**
   * Returns an iterator for the given Set.
   *
   * @param values The Set of values to iterate.
   * @returns A new iterator for the given Set.
   */
  public static set<T> (values: Set<T> = new Set<T>()): Iterate<T, T, Set<T>>
  {
    return Iterate.hasEntries<T, T, Set<T>>(
      values,
      (set, key) => set.delete(key),
      (set, key, value, newValue) => values.delete(value) && values.add(newValue)
    );
  }

  /**
   * Returns an iterator for any iterable. Because iterables don't support 
   *
   * @param values The iterable collection.
   * @returns A new iterator for the given set.
   */
  public static iterable<T> (values: Iterable<T>): Iterate<T, number, Iterable<T>>
  {
    return new Iterate<T, number, Iterable<T>>(iterator =>
    {
      const iterable = values[Symbol.iterator]();
      let index = 0;

      for (let next = iterable.next(); !next.done; next = iterable.next(), index++)
      {
        if (iterator.act(next.value, index) === IterateAction.STOP)
        {
          break;
        }
      }
    }).onReset(source => values = source);
  }

  /**
   * Returns an iterator for the given object optionally checking the
   * `hasOwnProperty` function on the given object.
   *
   * @param values The object to iterate.
   * @param hasOwnProperty If `hasOwnProperty` should be checked.
   * @returns A new iterator for the given object.
   */
  public static object<T> (values: { [key: string]: T }, hasOwnProperty: boolean = true): Iterate<T, string, { [key: string]: T }>
  {
    return new Iterate<T, string, { [key: string]: T }>(iterator =>
    {
      for (const key in values)
      {
        if (hasOwnProperty && !values.hasOwnProperty( key ))
        {
          continue;
        }

        switch (iterator.act(values[ key ], key))
        {
          case IterateAction.STOP:
            return;
          case IterateAction.REMOVE:
            delete values[ key ];
            break;
          case IterateAction.REPLACE:
            values[ key ] = iterator.replaceWith;
            break;
        }
      }
    }).onReset(source => values = source);
  }

  /**
   * Returns a function for iterating over a linked-list. You pass a node to 
   * the function returned (and whether it should be strict) and an iterator 
   * will be returned.
   * 
   * @param getValue A function which gets a value from a node.
   * @param getNext A function which returns the next node. When at the end 
   *    list null or undefined should be returned.
   * @param remove A function which handles a remove request. If this is not
   *    specified and a remove is called and `strict` is true an error will be
   *    thrown.
   * @param replaceValue A function which applies a value to a node. If this is
   *    not specified and a replace is called and `strict` is true an error
   *    will be thrown.
   */
  public static linked<N, T = any, K = T> (
    getValue: (node: N) => T,
    getNext: (node: N) => N | undefined | null,
    remove?: (node: N, prev: N) => any,
    replaceValue?: (node: N, value: T) => any,
    getKey?: (node: N) => K)
  {
    if (!getKey)
    {
      getKey = (node) => getValue(node) as unknown as K;
    }

    /**
     * Allows iteration of a linked list starting at a node.
     * 
     * If `strict` is true and a remove/replace is requested that can not be
     * done then an error will be thrown.
     * 
     * @param previousNode The previous node. This is necessary of the 
     *    starting node is requested to be removed, the user still needs a 
     *    reference to the first node.
     * @param strict If an error should be thrown when an unsupported action is
     *    requested.
     */
    return function linkedIterator(previousNode?: N, strict: boolean = true)
    {
      return new Iterate<T, K, N>(iterator =>
      {
        let prev: N = previousNode;
        let curr: N | undefined | null = getNext(previousNode);

        while (curr && curr !== previousNode)
        {
          const next = getNext(curr);
          let removed = false;

          switch (iterator.act(getValue(curr), getKey(curr)))
          {
            case IterateAction.STOP:
              return;

            case IterateAction.REMOVE:
              if (remove) {
                remove(curr, prev);
                removed = true;
              } else if (strict) {
                throw new Error('remove is required for linked list iteration');
              }
              break;

            case IterateAction.REPLACE:
              if (replaceValue) {
                replaceValue(curr, iterator.replaceWith);
              } else if (strict) {
                throw new Error('replace is required for linked list iteration');
              }
              break;
          }

          if (!removed) 
          {
            prev = curr; 
          }

          curr = next;
        }
      }).onReset(source => previousNode = source);
    };
  }

  /**
   * Returns a function for iterating over a tree. You pass a node to the 
   * function returned (and whether it should perform a depth-first or 
   * breadth-first traversal) and an iterator will be returned.
   * 
   * @param getValue A function which gets a value from a node.
   * @param getChildren A function which returns an array of child nodes or an 
   *    iterator which can return the children.
   * @param replaceValue A function which applies a value to a node.
   */
  public static tree<N, T = any, K = T> (
    getValue: (node: N) => T, 
    getChildren: (node: N) => N[] | Iterate<N, any, any> | undefined | null, 
    replaceValue?: (node: N, value: T) => any,
    getKey?: (node: N) => K)
  {
    if (!getKey)
    {
      getKey = (node) => getValue(node) as unknown as K;
    }

    // The iterator to return when a node doesn't have children.
    const NO_CHILDREN = Iterate.empty<N, any, any>();

    // Returns an Iterate for the children of the node
    const getChildIterate = (node: N): Iterate<N, any, any> =>
    {
      const children = getChildren(node);

      return !children
        ? NO_CHILDREN
        : Array.isArray(children)
          ? Iterate.array(children)
          : children;
    };

    // Handles actions done to the given node
    const handleAction = (node: N, iter: Iterate<T, K, N>, strict: boolean, throwOnRemove: boolean, parent?: Iterate<N, any, any>): boolean =>
    {
      switch (iter.act(getValue(node), getKey(node)))
      {
        // call stop on the parent iterator and return false
        case IterateAction.STOP:
          if (parent) {
            parent.stop();
          }

          return false;

        // replace the value
        case IterateAction.REPLACE:
          if (replaceValue) {
            replaceValue(node, iter.replaceWith);
          } else if (strict) {
            throw new Error('replaceValue is required when replacing a value in a tree');
          }
          break;

        case IterateAction.REMOVE:
          if (parent) {
            parent.remove();
          } else if (strict && throwOnRemove) {
            throw new Error('remove is not supported for breadth-first iteration');
          }
          break;
      }

      return true;
    };

    // Performs a depth-first iteration on the given tree
    const traverseDepthFirst = (node: N, iter: Iterate<T, K, N>, strict: boolean, parent?: Iterate<N, any, any>): boolean =>
    { 
      if (!handleAction(node, iter, strict, false, parent))
      {
        return false;
      }

      return !getChildIterate(node)
        .each((child, childKey, childIter) => traverseDepthFirst(child, iter, strict, childIter))
        .isStopped();
    };

    // Performs a breadth-first iteration on the given tree
    const traverseBreadthFirst = (node: N, iter: Iterate<T, K, N>, strict: boolean): void =>
    {
      const queue: N[] = [];

      queue.push(node);

      while (queue.length > 0)
      {
        const next = queue.shift();

        if (!handleAction(next, iter, strict, true))
        {
          break;
        }

        getChildIterate(next).array(queue);
      }
    };

    /**
     * Performs a breath-first or depth-first traversal of the tree starting
     * at the given node. Removing a node is only permitted for depth-first 
     * traversals. Replace is only performed when `replaceValue` is passed
     * to the [[Iterate.tree]] function.
     * 
     * If `strict` is true and a remove/replace is requested that can not be
     * done then an error will be thrown.
     * 
     * @param startingNode The node to start traversing at.
     * @param depthFirst True for a depth-first traversal, false for a 
     *    breadth-first traversal.
     * @param strict If an error should be thrown when an unsupported action is
     *    requested.
     */
    return function treeIterator (startingNode?: N, depthFirst: boolean = true, strict: boolean = true): Iterate<T, K, N>
    {
      return new Iterate<T, K, N>(iter => depthFirst
        ? traverseDepthFirst(startingNode, iter, strict)
        : traverseBreadthFirst(startingNode, iter, strict)
      ).onReset(source => startingNode = source);
    };
  }

  /**
   * Joins all the given sources into a single iterator where the values
   * returned are in the same order as passed to this function. If any values
   * are removed from the returned iterator they will be removed from the given
   * iterator if it supports removal.
   *
   * @param sources The sources to get iterators for to join.
   * @returns A new iterator for the given sources.
   */
  public static join<T, K, S> (...sources: Iterate<T, K, S>[]): Iterate<T, K, S>;
  public static join<S, T extends GetValueFor<S>, K extends GetKeyFor<S>> (...sources: S[]): Iterate<T, K, S>;
  public static join<T, K> (...sources: IterateSourceTypeKey<T, K>[]): Iterate<T, K, any>;
  public static join<T> (...sources: IterateSourceType<T>[]): Iterate<T, any, any>;
  public static join (...sources: IterateSourceType<any>[]): Iterate<any, any, any>;
  public static join<T, K, S> (...sources: any[]): Iterate<T, K, S>
  {
    return new Iterate<T, K, S>(parent =>
    {
      const iterators = sources.map(iterate);

      for (const child of iterators)
      {
        child.each((value, key, childIterate) =>
        {
          switch (parent.act( value as T, key as unknown as K ))
          {
            case IterateAction.REMOVE:
              childIterate.remove();
              break;
            case IterateAction.STOP:
              childIterate.stop();
              break;
            case IterateAction.REPLACE:
              childIterate.replace( parent.replaceWith );
              break;
          }
        });

        if (child.action === IterateAction.STOP)
        {
          return;
        }
      }
    });
  }

  /**
   * Returns a new iterator with no values.
   *
   * @returns A new iterator with no values.
   */
  public static empty<T, K, S> (): Iterate<T, K, S>
  {
    return new Iterate<T, K, S>(parent => { return; });
  }

  /**
   * Generates a reusable function which takes a source and performs a 
   * pre-defined set of views, operations, and mutations.
   * 
   * @param execute The function which performs the function.
   */
  public static func<T = any, R = void, A extends any[] = [], K = any, S = any> (execute: IterateFunctionExecute<T, R, A, K, S>): IterateFunction<T, R, A, K, S>
  {
    return (source, ...args) => 
    {
      const subject = iterate(source) as unknown as Iterate<T, K, S>;
      let result: R;

      execute(subject, latestResult => result = latestResult, ...args);

      return result;
    };
  }

}
