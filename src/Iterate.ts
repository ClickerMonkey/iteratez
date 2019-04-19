import { IterateAction } from "./IterateAction";
import { IterateCallback, IterateCompare, IterateEquals, IterateFilter, IterateSource } from "./types";


/**
 * A class that allows an iteratable source to be iterated any number of times.
 *
 * There are 3 types of functions in an Iterate:
 * - **Operation**: produces a result from the items in the iterator.
 * - **View**: produces a new iterator, the original iterator is not affected.
 * - **Mutation**: modifies the source based on the values in the current iterator.
 * 
 * The **View** functions do not iterate over the source, the iterator they
 * return does not iterate over the source until an **Operation** or 
 * **Mutation** function are called on it.
 * 
 * **Operations**
 * - `empty`: Determines whether the view contains no items.
 * - `has`: Determines whether the view contains any items.
 * - `contains`: Determines if the view contains a specific item.
 * - `first`: Gets the first item in the view.
 * - `last`: Gets the last item in the view.
 * - `count`: Counds the number of items in the view.
 * - `array`: Builds an array of the items in the view.
 * - `set`: Builds a Set of the items in the view.
 * - `object`: Builds an object of the items in the view.
 * - `group`: Builds an object of item arrays grouped by a value derived from each item.
 * - `reduce`: Reduces the items in the view down to a single value.
 * - `min`: Returns the minimum item in the view.
 * - `max`: Returns the maximum item in the view.
 * - `iterate`: Invokes a function for each item in the view.
 * - `copy`: Copies the items in the view and returns a new iterator.
 * 
 * **Mutations**
 * - `delete`: Removes items in the view from the source.
 * - `overwrite`: Replaces items in the view from the source.
 * - `extract`: Removes items in the view from the source and returns a new iterator with the removed items.
 * 
 * **Views**
 * Returns an iterator...
 * - `where`: for a subset of the items.
 * - `not`: for a subset of the items (opposite of where).
 * - `transform`: that transforms the items to another type.
 * - `reverse`: that iterates over the items in reverse order.
 * - `exclude`: that excludes items found in another iterator.
 * - `intersect`: that has common items in another iterator.
 * - `sorted`: that is sorted based on some comparison.
 * - `shuffle`: that is randomly ordered.
 * - `unique`: that has only unique values.
 * - `duplicates`: that has all the duplicate values.
 * - `readonly`: that ignores mutations.
 * - `take`: that only iterates over the first X items.
 * - `skip`: that skips the first X items.
 * - `drop`: that drops off the last X items.
 * - `append`: that is the original iterator + one or more iterators specified.
 * - `prepend`: that is one or more iterators specified + the original iterator.
 * - `gt`: that only has items greater than a value.
 * - `gte`: that only has items greater than or equal to a value.
 * - `lt`: that only has items less than a value.
 * - `lte`: that only has items less than or equal to a value.
 * - `sub`: that is this, but allows a function to perform sub operations
 * - `split`: Splits the items into two iterators (pass/fail) based on a condition.
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
 * The following static functions exist to help iterate simple sources:
 *
 * - `array`: Iterates an array.
 * - `object`: Iterates the properties of an object, optionally just the properties explicitly set on the object.
 * - `tree`: Iterates trees.
 * - `linked`: Iterates linked-lists.
 * - `empty`: Iterates nothing.
 * - `iterable`: Iterates any collection that implements iterable.
 * - `join`: Returns an iterator that iterates over one or more iterators.
 *
 * @typeparam T The type of item being iterated.
 */
export class Iterate<T>
{

  /**
   * An equality check by reference.
   */
  public static EQUALS_STRICT: IterateEquals<unknown> = (a, b) => a === b;

  /**
   * An equality check by value.
   */ // tslint:disable-next-line: triple-equals
  public static EQUALS_LOOSE: IterateEquals<unknown> = (a, b) => a == b;

  /**
   * A result of the iteration passed to [[Iterate.stop]].
   */
  public result: any = null;

  /**
   * The last action (if any) called on this iterator.
   */
  public action: IterateAction;

  /**
   * The value to replace with the current item.
   */
  public replaceWith: T;

  /**
   * The current callback passed to the iterator.
   */
  public callback: IterateCallback<T, any>;

  /**
   * The source of iterable items. This allows the iteration over any type of
   * structure. The source must call the callback for each item and its
   * recommended that the source checks the [[Iterate.iterating]] flag after
   * each callback invokation.
   */
  private source: IterateSource<T>;

  /**
   * The equality checker to use for this iterator and subsequent views.
   */
  private equality: IterateEquals<T>;

  /**
   * The comparator to use for this iterator and subsequent views.
   */
  private comparator: IterateCompare<T>;

  /**
   * Creates a new Iterate given a source.
   *
   * @param source The source of items to iterator.
   */
  public constructor (source: IterateSource<T>, parent?: Iterate<T>)
  {
    this.source = source;

    if (parent)
    {
      this.equality = parent.equality;
      this.comparator = parent.comparator;
    }
  }

  /**
   * Returns a clone of this iterator with the same source. This is necessary
   * if you want to iterate all or a portion of the source while already
   * iterating it (like a nested loop).
   */
  public clone (): Iterate<T>
  {
    return new Iterate<T>( this.source, this );
  }

  /**
   * Passes the given item to the iterator callback and returns the action
   * requested at this point in iteration.
   *
   * @param item The current item being iterated.
   */
  public act (item: T): IterateAction
  {
    this.action = IterateAction.CONTINUE;
    this.replaceWith = null;

    this.callback( item, this );

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
   * Signals to the iterator source that the current item wants to be removed.
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
  public withEquality (equality: IterateEquals<T>): this
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
  public withComparator (comparator: IterateCompare<T>): this
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
  private withLogic<A> (comparator: IterateCompare<A>, equality?: IterateEquals<A>): this
  {
    this.comparator = comparator as unknown as IterateCompare<T>;
    this.equality = (equality || ((a: A, b: A) => comparator(a, b) === 0)) as unknown as IterateEquals<T>;

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
    const isType = (x: any) => typeof x === 'number' && isFinite(x);
    const comparator: IterateCompare<number> = (a, b) => a - b;

    return this.withLogic<number>(
      (a, b) => Iterate.compare<number>(ascending, nullsFirst, a, b, isType, comparator)
    );
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
    const isType = (x: any) => typeof x === 'string';
    const comparator: IterateCompare<string> = sensitive
      ? (a, b) => a.localeCompare(b)
      : (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())

    return this.withLogic<string>(
      (a, b) => Iterate.compare<string>(ascending, nullsFirst, a, b, isType, comparator)
    );
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
    const MILLIS_IN_MINUTE = 60000;

    const isType = (x: any) => x instanceof Date;
    const comparator: IterateCompare<Date> = (a, b) => a.getTime() - b.getTime();
    const getTime = utc
      ? (a: Date) => a.getTime()
      : (a: Date) => a.getTime() + a.getTimezoneOffset() * MILLIS_IN_MINUTE;
    const equality: IterateEquals<Date> = (a, b) => (getTime(a) % equalityTimespan) === (getTime(b) % equalityTimespan);

    return this.withLogic(
      (a, b) => Iterate.compare<Date>(ascending, nullsFirst, a, b, isType, comparator),
      (a, b) => Iterate.equals<Date>(a, b, isType, equality)
    );
  }

  /**
   * Reverses the comparator on this iterator and subsequent views. If this
   * iterator does not have a comparator this has no affect.
   * 
   * @param comparator An override for any existing comparison logic.
   */
  public desc (comparator?: IterateCompare<T>): this
  {
    const compare = comparator || this.comparator;

    this.comparator = (a, b) => compare(b, a);

    return this;
  }

  /**
   * Gets the equality logic desired, optionally overriding the one specified
   * on this iterator.
   * 
   * @param equalityOverride Equality logic to use if provided.
   */
  public getEquality (equalityOverride?: IterateEquals<T>): IterateEquals<T>
  {
    return equalityOverride || this.equality || Iterate.EQUALS_STRICT;
  }

  /**
   * Gets the comparison logic desired, optionally overriding the one specified
   * on this iterator. If one cannot be determined an error is thrown.
   * 
   * @param comparatorOverride Comparison logic to use if provided.
   */
  public getComparator (comparatorOverride?: IterateCompare<T>): IterateCompare<T>
  {
    const chosen = comparatorOverride || this.comparator;

    if (!chosen)
    {
      throw new Error('A comparator is required for the requested action');
    }

    return chosen;
  }

  /**
   * An operation that determines whether this iterator is empty.
   *
   * @returns `true` if no valid items exist in the iterator.
   */
  public empty (): boolean
  {
    return !this.iterate((item, iterator) => iterator.stop()).isStopped();
  }

  /**
   * An operation that determines whether this iterator has an item. 
   *
   * @returns `true` if no valid items exist in the iterator.
   */
  public has (): boolean
  {
    return this.iterate((item, iterator) => iterator.stop()).isStopped();
  }

  /**
   * An operation that determines whether this iterator has the given value.
   * 
   * @param value The value to search for.
   * @param equality An override for any existing equality logic.
   */
  public contains (value: T, equality?: IterateEquals<T>): boolean
  {
    return this.where(other => this.getEquality(equality)(value, other)).has();
  }

  /**
   * An operation that counts the number of items in the iterator.
   *
   * @returns The number of items in the iterator.
   */
  public count (): number
  {
    let total: number = 0;

    this.iterate((item, iterator) => total++);

    return total;
  }

  /**
   * An operation that returns the first item in the iterator. 
   *
   * @returns The first item found.
   */
  public first (): T
  {
    return this.iterate((item, iterator) => iterator.stop(item)).result;
  }

  /**
   * An operation that returns the last item in the iterator.
   *
   * @returns The last item found.
   */
  public last (): T
  {
    let last: T = null;

    this.iterate((item, iterator) => last = item);

    return last;
  }

  /**
   * An operation that builds an array of items from the source.
   *
   * @param out The array to place the items in.
   * @returns The reference to `out` which has had items added to it.
   */
  public array (out: T[] = []): T[]
  {
    this.iterate(item => out.push( item ));

    return out;
  }

  /**
   * An operation that builds an object of items from the iterator keyed by a 
   * result returned by a `getKey` function.
   *
   * @param getKey The function which returns the key of the object.
   * @param out The object to place the items in.
   * @returns The reference to `out` which has had items set to it.
   */
  public object<O = { [key: string]: T }> (getKey: (item: T) => keyof O, out: O = Object.create(null)): O
  {
    this.iterate(item => out[ getKey( item ) as string ] = item);

    return out;
  }

  /**
   * An operation that builds a Set of items from the source.
   *
   * @param out The Set to place the items in.
   * @returns The reference to `out` which has had items added to it.
   */
  public set (out: Set<T> = new Set()): Set<T>
  {
    this.iterate(item => out.add( item ));

    return out;
  }

  /**
   * An operation that returns an object with arrays of items where the 
   * property of the object is a key returned by a function.
   * 
   * @param by A function to get the key from an item.
   * @param out The object to add groups to.
   * @returns The reference to `out` which has had items added to it.
   */
  public group<G extends { [by: string]: T[] }> (by: (item: T) => any, out: G = Object.create(null)): G
  {
    this.iterate(item => 
    {
      const key = by(item);

      if (key in out) 
      {
        out[key].push(item);
      } 
      else 
      {
        out[key] = [item];
      }
    });

    return out;
  }

  /**
   * An operation that reduces all the items in the source to a single value 
   * given the initial value and a function to convert an item and the current 
   * reduced value
   * 
   * @param initial The initial value to pass to the `reducer` function the 
   *    first time.
   * @param reducer A function which takes an item in the iterator and the 
   *    current reduced value and returns a new reduced value.
   */
  public reduce<R> (initial: R, reducer: (item: T, reduced: R) => R): R
  {
    let reduced: R = initial;

    this.iterate(item => reduced = reducer( item, reduced ));

    return reduced;
  }

  /**
   * An operation that returns the minimum item in this iterator. If this 
   * iterator is empty null is returned.
   * 
   * @param comparator An override for any existing comparison logic.
   */
  public min (comparator?: IterateCompare<T>): T
  {
    const compare = this.getComparator(comparator);

    return this.reduce<T>(null, (item, min) => min === null || compare(item, min) < 0 ? item : min);
  }

  /**
   * An operation that returns the maximum item in this iterator. If this 
   * iterator is empty null is returned.
   * 
   * @param comparator An override for any existing comparison logic.
   */
  public max (comparator?: IterateCompare<T>): T
  {
    const compare = this.getComparator(comparator);

    return this.reduce<T>(null, (item, max) => max === null || compare(item, max) > 0 ? item : max);
  }

  /**
   * A mutation which removes items in this iterator from the source.
   */
  public delete (): this
  {
    return this.iterate((item, iterator) => iterator.remove());
  }

  /**
   * A mutation which removes items in this iterator from the source and 
   * returns a new iterator with the removed items.
   */
  public extract (): Iterate<T>
  {
    const extracted: T[] = [];

    this.iterate((item, iterator) => extracted.push(item) && iterator.remove());

    return Iterate.array(extracted);
  }

  /**
   * A mutation which replaces items in this iterator from the source.
   * 
   * @param replacement The item to replace for all the items in this iterator.
   */
  public overwrite (replacement: T): this
  {
    return this.iterate((item, iterator) => iterator.replace(replacement));
  }

  /**
   * A sub-view which allows mutations and operations to be perfomed in a
   * separate chain and once done you can resume the chain after this sub.
   * 
   * @param subIterate A function which takes the iterator at this point and 
   *    performs any mutations and operations.
   * @returns The reference to this iterator.
   */
  public sub (subIterate: (sub: this) => any): this
  {
    subIterate(this);

    return this;
  }

  /**
   * Provides split views of the items in this iterator, one iterator gets
   * passed items and the other iterator gets the failed items.
   * 
   * You can pass a function as a second argument which recieves two iterators
   * for pass and fail respectively. This will be returned in that scenario.
   * 
   * If you don't pass a second function an object will be returned with two
   * properties: pass and fail.
   */
  public split (pass: IterateFilter<T>): { pass: Iterate<T>, fail: Iterate<T> };
  public split (pass: IterateFilter<T>, handle: (pass: Iterate<T>, fail: Iterate<T>) => any): this
  public split (by: IterateFilter<T>, handle?: (pass: Iterate<T>, fail: Iterate<T>) => any): any
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
   * Returns a view of this iterator. This allows other views to be more DRY.
   * 
   * @param getData Get any necessary data needed for the view.
   * @param shouldAct Based on the data and the item, should we act on it?
   * @param afterAct What to do if the item was acted on.
   * @param afterSkip What to do if the item was NOT acted on.
   */
  public view<D>(
    getData: () => D, 
    shouldAct: (data: D, item: T) => any, 
    afterAct?: (data: D, item: T, iter: Iterate<T>) => void, 
    afterSkip?: (data: D, item: T, iter: Iterate<T>) => void): Iterate<T>
  {
    return new Iterate<T>(next =>
    {
      const data = getData();

      this.iterate((item, prev) =>
      {
        if (shouldAct(data, item))
        {
          switch (next.act( item ))
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
            afterAct(data, item, prev);
          }
        }
        else if (afterSkip)
        {
          afterSkip(data, item, prev);
        }
      });

    }, this);
  }

  /**
   * Returns a view that only returns a maximum number of items.
   *
   * @param amount The maximum number of items to return.
   */
  public take (amount: number): Iterate<T>
  {
    if (amount <= 0)
    {
      return Iterate.empty();
    }

    return this.view<{ amount: number }>(
      () => ({ amount }),
      (data) => data.amount > 0,
      (data) => data.amount--,
      (data, item, iter) => iter.stop()
    );
  }

  /**
   * Returns a view that skips the given number of items from the items
   * in this iterator.
   *
   * @param amount The number of items to skip.
   */
  public skip (amount: number): Iterate<T>
  {
    return this.view<{ skipped: number }>(
      () => ({ skipped: 0 }),
      (data) => data.skipped >= amount,
      (data) => data.skipped++,
      (data) => data.skipped++
    );
  }

  /**
   * Returns a view that drops the given number of items from the end of the
   * items in this iterator.
   *
   * @param amount The number of items to drop from the end.
   */
  public drop (amount: number): Iterate<T>
  {
    return this.reverse().skip(amount).reverse();
  }

  /**
   * Returns a view thats items are the items in this iterator followed
   * by the items in the given iterators.
   *
   * @param iterators The iterators to append after this one.
   */
  public append (...iterators: Iterate<T>[]): Iterate<T>
  {
    return Iterate.join<T>( this, ...iterators );
  }

  /**
   * Returns a view thats items are the items in the given iterators
   * followed by the items in this iterator.
   *
   * @param iterators The iterators to prepend before this one.
   */
  public prepend (...iterators: Iterate<T>[]): Iterate<T>
  {
    return Iterate.join<T>( ...iterators, this );
  }

  /**
   * Returns a view of items in this iterator which pass a `where` function.
   *
   * @param where The function which determines if an item should be iterated.
   */
  public where (where: IterateFilter<T>): Iterate<T>
  {
    return this.view<null>(
      () => null,
      (data, item) => where(item)
    );
  }

  /**
   * Returns a view of items in this iterator which do NOT pass a `not` function.
   * 
   * @param not The function which determines if an item should be iterated.
   */
  public not (not: IterateFilter<T>): Iterate<T>
  {
    return this.view<null>(
      () => null,
      (data, item) => !not(item)
    );
  }

  /**
   * Returns a view where all items are greater than the given value.
   * If a comparator is not on this iterator or provided an error is thrown.
   * 
   * @param value The value to compare against.
   * @param comparator An override for any existing comparison logic.
   */
  public gt (value: T, comparator?: IterateCompare<T>): Iterate<T>
  {
    return this.view<IterateCompare<T>>(
      () => this.getComparator(comparator),
      (compare, item) => compare(item, value) > 0
    );
  }

  /**
   * Returns a view where all items are greater than or equal to the given value.
   * If a comparator is not on this iterator or provided an error is thrown.
   * 
   * @param value The value to compare against.
   * @param comparator An override for any existing comparison logic.
   */
  public gte (value: T, comparator?: IterateCompare<T>): Iterate<T>
  {
    return this.view<IterateCompare<T>>(
      () => this.getComparator(comparator),
      (compare, item) => compare(item, value) >= 0
    );
  }

  /**
   * Returns a view where all items are less than the given value.
   * If a comparator is not on this iterator or provided an error is thrown.
   * 
   * @param value The value to compare against.
   * @param comparator An override for any existing comparison logic.
   */
  public lt (value: T, comparator?: IterateCompare<T>): Iterate<T>
  {
    return this.view<IterateCompare<T>>(
      () => this.getComparator(comparator),
      (compare, item) => compare(item, value) < 0
    );
  }

  /**
   * Returns a view where all items are less than or equal to the given value.
   * If a comparator is not on this iterator or provided an error is thrown.
   * 
   * @param value The value to compare against.
   * @param comparator An override for any existing comparison logic.
   */
  public lte (value: T, comparator?: IterateCompare<T>): Iterate<T>
  {
    return this.view<IterateCompare<T>>(
      () => this.getComparator(comparator),
      (compare, item) => compare(item, value) <= 0
    );
  }

  /**
   * Returns a view of this iterator which does not include the items in the
   * given iterator.
   * 
   * @param values The iterator with items to exclude.
   * @param equality An override for any existing equality logic.
   */
  public exclude (values: Iterate<T>, equality?: IterateEquals<T>): Iterate<T>
  {
    return this.view<IterateEquals<T>>(
      () => this.getEquality(equality),
      (isEqual, item) => !values.contains(item, isEqual)
    );
  }

  /**
   * Returns a view which has items which are in this iterator and the given
   * iterator.
   * 
   * @param values The iterator with items to intersect with.
   * @param equality An override for any existing equality logic.
   */
  public intersect (values: Iterate<T>, equality?: IterateEquals<T>): Iterate<T>
  {
    return this.view<IterateEquals<T>>(
      () => this.getEquality(equality),
      (isEqual, item) => values.contains(item, isEqual)
    );
  }

  /**
   * Returns a view which only contains unique items.
   * 
   * @param equality An override for any existing equality logic.
   */
  public unique (equality?: IterateEquals<T>): Iterate<T>
  {
    return this.view<{ existing: T[], isEqual: IterateEquals<T> }>(
      () => ({ existing: [], isEqual: this.getEquality(equality) }),
      ({existing, isEqual}, item) => existing.findIndex(exist => isEqual(exist, item)) === -1,
      ({existing}, item) => existing.push(item)
    );
  }

  /**
   * Returns a view which only contains items that have duplicates in this 
   * iterator. For any items that occur more than twice you can exclude them
   * from the resulting view by passing `true` to `onlyOnce`.
   * 
   * @param onlyOnce If the view should contain unique or all duplicates.
   * @param equality An override for any existing equality logic.
   */
  public duplicates (onlyOnce: boolean = false, equality?: IterateEquals<T>): Iterate<T>
  { 
    return this.view<{ existing: T[], once: boolean[], isEqual: IterateEquals<T> }>(
      () => ({ existing: [], once: [], isEqual: this.getEquality(equality) }),
      ({existing, once, isEqual}, item) =>  {
        const index = existing.findIndex(exist => isEqual(exist, item));
        let act = index !== -1;

        if (act) {
          if (once[index] && onlyOnce) {
            act = false;
          }
          once[index] = true;
        } else {
          existing.push(item);
        }

        return act;
      }
    );
  }

  /**
   * Returns a readonly view where mutations have no affect.
   */
  public readonly (): Iterate<T>
  {
    return new Iterate<T>(next =>
    {
      this.iterate((item, prev) =>
      {
        if (next.act( item ) === IterateAction.STOP)
        {
          prev.stop()
        }
      });

    }, this);
  }

  /**
   * Returns a copy of the items in this view as a new iterator.
   */
  public copy (): Iterate<T>
  {
    return Iterate.array(this.array());
  }

  /**
   * Returns a view which requires a fully resolved array of items. The view 
   * must keep track of the original item index in order to ensure removals
   * and replaces can be performed on the source.
   * 
   * @param onResolve 
   */
  public viewResolved(onResolve: (items: T[], handleAct: (item: T, index: number) => IterateAction) => void): Iterate<T>
  {
    return new Iterate<T>(next =>
    {
      const items: T[] = this.array();
      const actions: IterateAction[] = [];
      const replaces: T[] = [];
      const original: T[] = [];

      let mutates: boolean = false;

      onResolve(items, (item, index) => 
      {
        const action = next.act(item);

        if (action === IterateAction.REPLACE || action === IterateAction.REMOVE)
        {
          mutates = true;
          original[ index ] = item;
          actions[ index ] = action;
          replaces[ index ] = next.replaceWith;
        }

        return action;
      });

      if (mutates)
      {
        let index: number = 0;

        this.iterate((item, modifyIterate) =>
        {
          switch (actions[ index ])
          {
            case IterateAction.REMOVE:
              if (item === original[index]) {
                modifyIterate.remove();
              }
              break;

            case IterateAction.REPLACE:
              if (item === original[index]) {
                modifyIterate.replace( replaces[ index ] );
              }
              break;
          }

          index++;
        });
      }

    }, this);
  }

  /**
   * Returns a view which has the items sorted.
   * 
   * @param comparator An override for any existing comparison logic.
   */
  public sorted (comparator?: IterateCompare<T>): Iterate<T>
  {
    return this.viewResolved((items, handleAct) =>
    {
      const compare = this.getComparator(comparator);
      const mapped = items.map((item, index) => ({ item, index }));

      mapped.sort((a, b) => compare(a.item, b.item));

      for (const {item, index} of mapped)
      {
        if (handleAct(item, index) === IterateAction.STOP)
        {
          return;
        }
      }
    });
  }

  /**
   * Returns an view of items in this iterator and presents them in a random order.
   */
  public shuffle (passes: number = 1): Iterate<T>
  {
    const swap = <X>(arr: X[], i: number, k: number) => {
      const t = arr[i];
      arr[i] = arr[k];
      arr[k] = t;
    }

    return this.viewResolved((items, handleAct) => 
    {
      const indices: number[] = [];
      const n = items.length;

      for (let i = 0; i < n; i++)
      {
        indices.push(i);
      }

      for (let pass = 0; pass < passes; pass++)
      {
        for (let k = 0; k < n; k++)
        {
          const j = Math.floor(Math.random() * n);
          swap(items, j, k);
          swap(indices, j, k);
        }
      }

      for (let i = 0; i < n; i++)
      {
        if (handleAct(items[i], indices[i]) === IterateAction.STOP)
        {
          return;
        }
      }
    });
  }

  /**
   * Returns an view of items in this iterator and presents them in reverse.
   */
  public reverse (): Iterate<T>
  {
    return this.viewResolved((items, handleAct) => 
    {
      for (let i = items.length - 1; i >= 0; i--)
      {
        if (handleAct(items[i], i) === IterateAction.STOP)
        {
          return;
        }
      }
    });
  }

  /**
   * Returns an iterator where this iterator is the source and the returned
   * iterator is built from transformed items pulled from items in the source
   * of this iterator. 
   *
   * @param transformer The function which transforms an item to another.
   * @param untransformer The function which untransforms a value when replace is called.
   */
  public transform<W>(transformer: IterateCallback<T, W>,
    untransformer: (replaceWith: W, current: W, item: T) => T = null): Iterate<W>
  {
    return new Iterate<W>(next =>
    {
      this.iterate((prevItem, prev) =>
      {
        const nextItem: W = transformer( prevItem, prev );

        if (typeof nextItem !== 'undefined')
        {
          switch (next.act( nextItem ))
          {
            case IterateAction.STOP:
              prev.stop();
              break;
            case IterateAction.REMOVE:
              prev.remove();
              break;
            case IterateAction.REPLACE:
              if (untransformer) {
                prev.replace( untransformer( next.replaceWith, nextItem, prevItem ) );
              }
              break;
          }
        }
      });
    });
  }

  /**
   * Invokes the callback for each item in the source of this iterator. The
   * second argument in the callback is the reference to this iterator and
   * [[Iterate.stop]] can be called at anytime to cease iteration.
   *
   * @param callback The function to invoke for each item in this iterator.
   */
  public iterate (callback: IterateCallback<T, any>): this
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
   * @param items The array of items to iterate.
   * @returns A new iterator for the given array.
   */
  public static array<T> (items: T[]): Iterate<T>
  {
    return new Iterate<T>(iterator =>
    {
      for (let i = 0; i < items.length; i++)
      {
        switch (iterator.act(items[ i ]))
        {
          case IterateAction.STOP:
            return;
          case IterateAction.REMOVE:
            items.splice(i, 1);
            i--;
            break;
          case IterateAction.REPLACE:
            items.splice(i, 1, iterator.replaceWith);
            break;
        }
      }
    });
  }

  /**
   * Returns an iterator for any iterable. Because iterables don't support 
   *
   * @param items The iterable collection.
   * @returns A new iterator for the given set.
   */
  public static iterable<T, I extends Iterable<T>> (items: I): Iterate<T>
  {
    return new Iterate<T>(iterator =>
    {
      const setIterator = items[Symbol.iterator]();
      let next = setIterator.next();

      while (!next.done)
      {
        if (iterator.act(next.value) === IterateAction.STOP)
        {
          break;
        }

        next = setIterator.next();
      }      
    });
  }

  /**
   * Returns an iterator for the given object optionally checking the
   * `hasOwnProperty` function on the given object.
   *
   * @param items The object to iterate.
   * @param hasOwnProperty If `hasOwnProperty` should be checked.
   * @returns A new iterator for the given object.
   */
  public static object<T> (items: { [key: string]: T }, hasOwnProperty: boolean = true): Iterate<T>
  {
    return new Iterate<T>(iterator =>
    {
      for (const key in items)
      {
        if (hasOwnProperty && !items.hasOwnProperty( key ))
        {
          continue;
        }

        switch (iterator.act(items[ key ]))
        {
          case IterateAction.STOP:
            return;
          case IterateAction.REMOVE:
            delete items[ key ];
            break;
          case IterateAction.REPLACE:
            items[ key ] = iterator.replaceWith;
            break;
        }
      }
    });
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
  public static linked<N, T = any> (
    getValue: (node: N) => T,
    getNext: (node: N) => N | undefined | null,
    remove?: (node: N, prev: N | undefined | null) => any,
    replaceValue?: (node: N, value: T) => any)
  {

    /**
     * Allows iteration of a linked list starting at a node.
     * 
     * If `strict` is true and a remove/replace is requested that can not be
     * done then an error will be thrown.
     * 
     * @param startingNode The node to start traversing at.
     * @param previousNode The previous node. This is necessary of the 
     *    starting node is requested to be removed, the user still needs a 
     *    reference to the first node.
     * @param strict If an error should be thrown when an unsupported action is
     *    requested.
     */
    return function linkedIterator(startingNode: N, previousNode?: N | null, strict: boolean = true)
    {
      return new Iterate<T>(iterator =>
      {
        let prev: N | undefined | null = previousNode;
        let curr: N | undefined | null = startingNode;

        while (curr && curr !== previousNode)
        {
          const next = getNext(curr);
          let removed = false;

          switch (iterator.act(getValue(curr)))
          {
            case IterateAction.STOP:
              return;

            case IterateAction.REMOVE:
              if (remove) {
                if (curr === startingNode) {
                  startingNode = next;
                }
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
      });
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
  public static tree<N, T = any> (
    getValue: (node: N) => T, 
    getChildren: (node: N) => N[] | Iterate<N> | undefined | null, 
    replaceValue?: (node: N, value: T) => any)
  {
    // The iterator to return when a node doesn't have children.
    const NO_CHILDREN = Iterate.empty<N>();

    // Returns an Iterate for the children of the node
    const getChildIterate = (node: N): Iterate<N> =>
    {
      const children = getChildren(node);

      return !children
        ? NO_CHILDREN
        : Array.isArray(children)
          ? Iterate.array(children)
          : children;
    };

    // Handles actions done to the given node
    const handleAction = (node: N, iter: Iterate<T>, strict: boolean, throwOnRemove: boolean, parent?: Iterate<N>): boolean =>
    {
      switch (iter.act(getValue(node)))
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
    const traverseDepthFirst = (node: N, iter: Iterate<T>, strict: boolean, parent?: Iterate<N>): boolean =>
    { 
      if (!handleAction(node, iter, strict, false, parent))
      {
        return false;
      }

      return !getChildIterate(node)
        .iterate((child, childIter) => traverseDepthFirst(child, iter, strict, childIter))
        .isStopped();
    };

    // Performs a breadth-first iteration on the given tree
    const traverseBreadthFirst = (node: N, iter: Iterate<T>, strict: boolean): void =>
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
    return function treeIterator (startingNode: N, depthFirst: boolean = true, strict: boolean = true): Iterate<T>
    {
      return new Iterate<T>(iter => depthFirst
        ? traverseDepthFirst(startingNode, iter, strict)
        : traverseBreadthFirst(startingNode, iter, strict)
      );
    };
  }

  /**
   * Joins all the given iterators into a single iterator where the items
   * returned are in the same order as passed to this function. If any items
   * are removed from the returned iterator they will be removed from the given
   * iterator if it supports removal.
   *
   * @param iterators The array of iterators to join as one.
   * @returns A new iterator for the given iterators.
   */
  public static join<T> (...iterators: Iterate<T>[]): Iterate<T>
  {
    return new Iterate<T>(parent =>
    {
      for (const child of iterators)
      {
        child.iterate((item, childIterate) =>
        {
          switch (parent.act( item ))
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
   * Returns a new iterator with no items.
   *
   * @returns A new iterator with no items.
   */
  public static empty<T> (): Iterate<T>
  {
    return new Iterate<T>(parent => { return; });
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
  public static compare<T> (ascending: boolean, nullsFirst: boolean, a: any, b: any, correctType: (x: any) => any, compare: IterateCompare<T>): number
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
    return ascending ? compare(a, b) : compare(b, a);
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
  public static equals<T> (a: any, b: any, correctType: (x: any) => any, equals: IterateEquals<T>): boolean
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
    return equals(a, b);
  }

}
