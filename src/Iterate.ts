import { IterateAction } from "./IterateAction";
import { IterateCallback, IterateCompare, IterateEquals, IterateFilter, IterateSource } from "./types";


/**
 * A class that allows an iteratable source to be iterated any number of times.
 *
 * There are 3 types of functions in an Iterate:
 * - **Operation**: produces a result from the items in the iterator.
 * - **View**: produces a new iterator, the original iterator is not affected.
 * - **Modifier**: modifies the source based on the values in the current iterator.
 * 
 * The **View** functions do not iterate over the source, the iterator they
 * return does not iterate over the source until an **Operation** or 
 * **Modifier** function are called on it.
 * 
 * **Operations**
 * - `empty`: Determines whether the view contains no items.
 * - `has`: Determines whether the view contains any items.
 * - `contains`: Determines if the view contains a specific item.
 * - `first`: Gets the first item in the view.
 * - `last`: Gets the last item in the view.
 * - `count`: Counds the number of items in the view.
 * - `list`: Builds an array of the items in the view.
 * - `set`: Builds a Set of the items in the view.
 * - `object`: Builds an object of the items in the view.
 * - `reduce`: Reduces the items in the view down to a single value.
 * - `min`: Returns the minimum item in ths view.
 * - `max`: Returns the maximum item in ths view.
 * - `iterate`: Invokes a function for each item in the view.
 * 
 * **Modifiers**
 * - `erase`: Removes items in the view from the source.
 * - `overwrite`: Replaces items in the view from the source.
 * - `extract`: Removes items in the view from the source and returns a new iterator with the removed items.
 * 
 * **Views**
 * Returns an iterator...
 * - `where`: for a subset of the items.
 * - `map`: that maps the items to another value.
 * - `reverse`: that iterates over the items in reverse order.
 * - `exclude`: that excludes items found in another iterator.
 * - `intersect`: that has common items in another iterator.
 * - `sorted`: that is sorted based on some comparison.
 * - `unique`: that has only unique values.
 * - `duplicates`: that has all the duplicate values.
 * - `take`: Returns an iterator that only iterates over the first X items.
 * - `skip`: Returns an iterator that skips the first X items.
 * - `drop`: Returns an iterator that drops off the last X items.
 * - `append`: Returns an iterator that is the original iterator + one or more iterators specified.
 * - `prepend`: Returns an iterator that is one or more iterators specified + the original iterator.
 * - `gt`: that only has items greater than a value.
 * - `gte`: that only has items greater than or equal to a value.
 * - `lt`: that only has items less than a value.
 * - `lte`: that only has items less than or equal to a value.
 * - `sub`: that is this, but allows a function to perform sub operations
 * 
 * The following static functions exist to help iterate simple sources:
 *
 * - `array`: Iterates an array, optionally reverse.
 * - `object`: Iterates the properties of an object, optionally just the properties explicitly set on the object.
 * - `empty`: An iterator with no items
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
   * An equality check for case sensitive strings.
   */
  public static EQUALS_STRING_SENSITIVE: IterateEquals<string> = (a, b) => a.localeCompare(b) === 0;

  /**
   * An equality check for case insensitive strings.
   */
  public static EQUALS_STRING_INSENSITIVE: IterateEquals<string> = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()) === 0;

  /**
   * A comparator for numbers.
   */
  public static COMPARE_NUMBER: IterateCompare<number> = (a, b) => a - b;

  /**
   * A comparator for strings.
   */
  public static COMPARE_STRING: IterateCompare<string> = (a, b) => a.localeCompare(b);

  /**
   * A comparator for Dates.
   */
  public static COMPARE_DATE: IterateCompare<Date> = (a, b) => (a ? a.getTime() : 0) - (b ? b.getTime() : 0);


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
   * An operation that builds a list of items from the source.
   *
   * @param out The array to place the items in.
   * @returns The reference to `out` which has had items added to it.
   */
  public list (out: T[] = []): T[]
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
   * A modifier which removes items in this iterator from the source.
   */
  public erase (): this
  {
    return this.iterate((item, iterator) => iterator.remove());
  }

  /**
   * A modifier which removes items in this iterator from the source and 
   * returns a new iterator with the removed items.
   */
  public extract (): Iterate<T>
  {
    const extracted: T[] = [];

    this.iterate((item, iterator) => extracted.push(item) && iterator.remove());

    return Iterate.array(extracted);
  }

  /**
   * A modifier which replaces items in this iterator from the source.
   * 
   * @param replacement The item to replace for all the items in this iterator.
   */
  public overwrite (replacement: T): this
  {
    return this.iterate((item, iterator) => iterator.replace(replacement));
  }

  /**
   * An sub-view which allows modifiers and operations to be perfomed in a
   * separate chain and once done you can resume the chain after this sub.
   * 
   * @param subIterate A function which takes the iterator at this point and 
   *    performs any modifiers and operations.
   * @returns The reference to this iterator.
   */
  public sub (subIterate: (sub: this) => any): this
  {
    subIterate(this);

    return this;
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
   * Returns a view which requires a fully resolved list of items. The view 
   * must keep track of the original item index in order to ensure removals
   * and replaces can be performed on the source.
   * 
   * @param onResolve 
   */
  public viewResolved(onResolve: (items: T[], handleAct: (item: T, index: number) => IterateAction) => void): Iterate<T>
  {
    return new Iterate<T>(next =>
    {
      const items: T[] = this.list();
      const actions: IterateAction[] = [];
      const replaces: T[] = [];
      const original: T[] = [];

      let modifies: boolean = false;

      onResolve(items, (item, index) => 
      {
        const action = next.act(item);

        if (action === IterateAction.REPLACE || action === IterateAction.REMOVE)
        {
          modifies = true;
          original[ index ] = item;
          actions[ index ] = action;
          replaces[ index ] = next.replaceWith;
        }

        return action;
      });

      if (modifies)
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
   * iterator is built from mapped items pulled from items in the source
   * of this iterator. 
   *
   * @param mapper The function which maps an item to another.
   * @param unmapper The function which unmaps a value when replace is called.
   */
  public map<W>(mapper: IterateCallback<T, W>,
    unmapper: (replaceWith: W, current: W, item: T) => T = null): Iterate<W>
  {
    return new Iterate<W>(next =>
    {
      this.iterate((prevItem, prev) =>
      {
        const nextItem: W = mapper( prevItem, prev );

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
              if (unmapper) {
                prev.replace( unmapper( next.replaceWith, nextItem, prevItem ) );
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
    return this.list().values();
  }

  /**
   * Returns an iterator for the given array optionally iterating it in reverse.
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
   * Returns a function for iterating over a tree. You pass a node to the 
   * function returned (and whether it should perform a depth-first or 
   * breadth-first traversal) and an iterator will be returned.
   * 
   * @param getValue A function which gets a value from a node.
   * @param getChildren A function which returns an array of child nodes or an 
   *    iterator which can return the children.
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

        getChildIterate(next).list(queue);
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

}
