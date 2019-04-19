import { IterateAction } from "./IterateAction";
import { GetKeyFor, GetValueFor, HasEntries, IterateCallback, IterateCompare, IterateEquals, IterateFilter, IterateSource, IterateSourceType, IterateSourceTypeKey } from "./types";
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
 * - `entries`: Builds an array of `[key, value]` in the view.
 * - `map`: Builds a Map of the items and keys in the view.
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
 * - `keys`: only for the keys of the items (replace not supported).
 * - `values`: only for the values of the items (new key is index based).
 * - `take`: that only iterates over the first X items.
 * - `skip`: that skips the first X items.
 * - `drop`: that drops off the last X items.
 * - `append`: that is the original iterator + one or more iterators specified.
 * - `prepend`: that is one or more iterators specified + the original iterator.
 * - `gt`: that only has items greater than a value.
 * - `gte`: that only has items greater than or equal to a value.
 * - `lt`: that only has items less than a value.
 * - `lte`: that only has items less than or equal to a value.
 * - `fork`: that is this, but allows a function to perform fork operations
 * - `split`: Splits the items into two iterators (pass/fail) based on a condition.
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
 * @typeparam T The type of item being iterated.
 */
export declare class Iterate<T, K, S> {
    /**
     * An equality check by reference.
     */
    static EQUALS_STRICT: IterateEquals<any, any>;
    /**
     * An equality check by value.
     */ static EQUALS_LOOSE: IterateEquals<any, any>;
    /**
     * A result of the iteration passed to [[Iterate.stop]].
     */
    result: any;
    /**
     * The last action (if any) called on this iterator.
     */
    action: IterateAction;
    /**
     * The value to replace with the current item.
     */
    replaceWith: T;
    /**
     * The current callback passed to the iterator.
     */
    callback: IterateCallback<T, K, S, any>;
    /**
     * The source of iterable items. This allows the iteration over any type of
     * structure. The source must call the callback for each item and its
     * recommended that the source checks the [[Iterate.iterating]] flag after
     * each callback invokation.
     */
    private source;
    /**
     * The equality checker to use for this iterator and subsequent views.
     */
    private equality;
    /**
     * The comparator to use for this iterator and subsequent views.
     */
    private comparator;
    /**
     * Creates a new Iterate given a source.
     *
     * @param source The source of items to iterator.
     */
    constructor(source: IterateSource<T, K, S>, parent?: Iterate<T, any, any>);
    /**
     * Returns a clone of this iterator with the same source. This is necessary
     * if you want to iterate all or a portion of the source while already
     * iterating it (like a nested loop).
     */
    clone(): Iterate<T, K, S>;
    /**
     * Passes the given item to the iterator callback and returns the action
     * requested at this point in iteration.
     *
     * @param item The current item being iterated.
     */
    act(item: T, key: K): IterateAction;
    /**
     * Stops iteration and optionally sets the result of the iteration.
     *
     * @param result The result of the iteration.
     */
    stop(result?: any): this;
    /**
     * Returns whether iteration was stopped by the user.
     */
    isStopped(): boolean;
    /**
     * Stops iteration and optionally sets the result of the iteration.
     *
     * @param result The result of the iteration.
     */
    replace(replaceWith: T): this;
    /**
     * Signals to the iterator source that the current item wants to be removed.
     */
    remove(): this;
    /**
     * Sets the equality logic for this iterator and subsequent views.
     *
     * @param equality A function to compare two values for equality.
     */
    withEquality(equality: IterateEquals<T, K>): this;
    /**
     * Sets the comparison logic for this iterator and subsequent views. If this
     * iterator does not have an equality check, this will also use the
     * comparator for the equality logic.
     *
     * @param comparator A function which compares tow values.
     */
    withComparator(comparator: IterateCompare<T, K>): this;
    /**
     * Applies the logic to the iterator.
     *
     * @param comparator The comparison logic.
     * @param equality The equality logic if the comparison logic won't suffice.
     */
    private withLogic;
    /**
     * Applies number equality and comparison logic to this iterator and
     * subsequent ones.
     *
     * @param ascending If the numbers should be in ascending order.
     * @param nullsFirst If non-number values should be ordered first.
     */
    numbers(ascending?: boolean, nullsFirst?: boolean): this;
    /**
     * Applies string equality and comparison logic to this iterator and
     * subsequent ones.
     *
     * @param sensitive If equality logic should be case sensitive.
     * @param ascending If the strings should be in ascending order.
     * @param nullsFirst If non-strings values should be ordered first.
     */
    strings(sensitive?: boolean, ascending?: boolean, nullsFirst?: boolean): this;
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
    dates(equalityTimespan?: number, utc?: boolean, ascending?: boolean, nullsFirst?: boolean): this;
    /**
     * Reverses the comparator on this iterator and subsequent views. If this
     * iterator does not have a comparator this has no affect.
     *
     * @param comparator An override for any existing comparison logic.
     */
    desc(comparator?: IterateCompare<T, K>): this;
    /**
     * Gets the equality logic desired, optionally overriding the one specified
     * on this iterator.
     *
     * @param equalityOverride Equality logic to use if provided.
     */
    getEquality(equalityOverride?: IterateEquals<T, K>): IterateEquals<T, K>;
    /**
     * Gets the comparison logic desired, optionally overriding the one specified
     * on this iterator. If one cannot be determined an error is thrown.
     *
     * @param comparatorOverride Comparison logic to use if provided.
     */
    getComparator(comparatorOverride?: IterateCompare<T, K>): IterateCompare<T, K>;
    /**
     * An operation that determines whether this iterator is empty.
     *
     * @returns `true` if no valid items exist in the iterator.
     */
    empty(): boolean;
    /**
     * An operation that determines whether this iterator has an item.
     *
     * @returns `true` if no valid items exist in the iterator.
     */
    has(): boolean;
    /**
     * An operation that determines whether this iterator has the given value.
     *
     * @param value The value to search for.
     * @param equality An override for any existing equality logic.
     */
    contains(value: T, equality?: IterateEquals<T, K>): boolean;
    /**
     * An operation that counts the number of items in the iterator.
     *
     * @returns The number of items in the iterator.
     */
    count(): number;
    /**
     * An operation that returns the first item in the iterator.
     *
     * @returns The first item found.
     */
    first(): T;
    /**
     * An operation that returns the last item in the iterator.
     *
     * @returns The last item found.
     */
    last(): T;
    /**
     * An operation that builds an array of items from the source.
     *
     * @param out The array to place the items in.
     * @returns The reference to `out` which has had items added to it.
     */
    array(out?: T[]): T[];
    /**
     * An operation that builds an array of [key, item] entries from this view.
     *
     * @param out The array to place the entries in.
     * @returns The reference to `out` which has had entries added to it.
     */
    entries(out?: Array<[K, T]>): Array<[K, T]>;
    /**
     * An operation that builds an object of items from the iterator keyed by a
     * result returned by a `getKey` function.
     *
     * @param getKey The function which returns the key of the object.
     * @param out The object to place the items in.
     * @returns The reference to `out` which has had items set to it.
     */
    object<O = {
        [key: string]: T;
    }>(getKey: (item: T) => keyof O, out?: O): O;
    /**
     * An operation that builds a Set of items from the source.
     *
     * @param out The Set to place the items in.
     * @returns The reference to `out` which has had items added to it.
     */
    set(out?: Set<T>): Set<T>;
    /**
     * An operation that builds a Map of key-value pairs from the source.
     *
     * @param out The Map to place the items in.
     * @returns The reference to `out` which has had items added to it.
     */
    map(out?: Map<K, T>): Map<K, T>;
    /**
     * An operation that returns an object with arrays of items where the
     * property of the object is a key returned by a function.
     *
     * @param by A function to get the key from an item.
     * @param out The object to add groups to.
     * @returns The reference to `out` which has had items added to it.
     */
    group<G extends {
        [by: string]: T[];
    }>(by: (item: T) => any, out?: G): G;
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
    reduce<R>(initial: R, reducer: (item: T, reduced: R) => R): R;
    /**
     * An operation that returns the minimum item in this iterator. If this
     * iterator is empty null is returned.
     *
     * @param comparator An override for any existing comparison logic.
     */
    min(comparator?: IterateCompare<T, K>): T;
    /**
     * An operation that returns the maximum item in this iterator. If this
     * iterator is empty null is returned.
     *
     * @param comparator An override for any existing comparison logic.
     */
    max(comparator?: IterateCompare<T, K>): T;
    /**
     * A mutation which removes items in this iterator from the source.
     */
    delete(): this;
    /**
     * A mutation which removes items in this iterator from the source and
     * returns a new iterator with the removed items.
     */
    extract(): Iterate<T, K, Array<[K, T]>>;
    /**
     * A mutation which replaces items in this iterator from the source.
     *
     * @param replacement The item to replace for all the items in this iterator.
     */
    overwrite(replacement: T): this;
    /**
     * Forks this view into another and returns a reference to this view.
     * This allows chaining of multiple views which each perform a different
     * operation or mutation. Forks are executed sequentially, so if one fork
     * performs mutations the subsequent forks will see the mutated items.
     *
     * @param forker A function which takes the iterator at this point and
     *    performs any mutations and operations.
     * @returns The reference to this iterator.
     */
    fork(forker: (fork: this) => any): this;
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
    split(pass: IterateFilter<T, K>): {
        pass: Iterate<T, K, S>;
        fail: Iterate<T, K, S>;
    };
    split(pass: IterateFilter<T, K>, handle: (pass: Iterate<T, K, S>, fail: Iterate<T, K, S>) => any): this;
    /**
     * Unzips the view into a keys and values views.
     *
     * You can pass a function as a second argument which recieves two iterators
     * for keys and values respectively. This will be returned in that scenario.
     *
     * If you don't pass a second function an object will be returned with two
     * properties: keys and values.
     */
    unzip(): {
        keys: Iterate<K, number, S>;
        values: Iterate<T, number, S>;
    };
    unzip(handle: (keys: Iterate<K, number, S>, values: Iterate<T, number, S>) => any): this;
    /**
     * Returns a view of just the keys in this view. Any mutations done to the
     * keys view affect the underlying source.
     */
    keys(): Iterate<K, number, S>;
    /**
     * Returns a view of just the values in this view. Any mutations done to the
     * values view affect the underlying source.
     */
    values(): Iterate<T, number, S>;
    /**
     * Returns a view of this iterator. This allows other views to be more DRY.
     *
     * @param getData Get any necessary data needed for the view.
     * @param shouldAct Based on the data and the item, should we act on it?
     * @param afterAct What to do if the item was acted on.
     * @param afterSkip What to do if the item was NOT acted on.
     */
    view<D>(getData: () => D, shouldAct: (data: D, item: T, key: K) => any, afterAct?: (data: D, item: T, key: K, iter: Iterate<T, K, S>) => void, afterSkip?: (data: D, item: T, key: K, iter: Iterate<T, K, S>) => void): Iterate<T, K, S>;
    /**
     * Returns a view that only returns a maximum number of items.
     *
     * @param amount The maximum number of items to return.
     */
    take(amount: number): Iterate<T, K, S>;
    /**
     * Returns a view that skips the given number of items from the items
     * in this iterator.
     *
     * @param amount The number of items to skip.
     */
    skip(amount: number): Iterate<T, K, S>;
    /**
     * Returns a view that drops the given number of items from the end of the
     * items in this iterator.
     *
     * @param amount The number of items to drop from the end.
     */
    drop(amount: number): Iterate<T, K, S>;
    /**
     * Returns a view thats items are the items in this iterator followed
     * by the items in the given iterators.
     *
     * @param iterators The iterators to append after this one.
     */
    append(...sources: S[]): Iterate<T, K, S>;
    append(...sources: IterateSourceTypeKey<T, K>[]): Iterate<T, K, any>;
    append(...sources: IterateSourceType<T>[]): Iterate<T, any, any>;
    append(...sources: IterateSourceType<any>[]): Iterate<any, any, any>;
    /**
     * Returns a view thats items are the items in the given iterators
     * followed by the items in this iterator.
     *
     * @param iterators The iterators to prepend before this one.
     */
    prepend(...sources: S[]): Iterate<T, K, S>;
    prepend(...sources: IterateSourceTypeKey<T, K>[]): Iterate<T, K, any>;
    prepend(...sources: IterateSourceType<T>[]): Iterate<T, any, any>;
    prepend(...sources: IterateSourceType<any>[]): Iterate<any, any, any>;
    /**
     * Returns a view of items in this iterator which pass a `where` function.
     *
     * @param where The function which determines if an item should be iterated.
     */
    where(where: IterateFilter<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view of items in this iterator which do NOT pass a `not` function.
     *
     * @param not The function which determines if an item should be iterated.
     */
    not(not: IterateFilter<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view where all items are greater than the given value.
     * If a comparator is not on this iterator or provided an error is thrown.
     *
     * @param value The value to compare against.
     * @param comparator An override for any existing comparison logic.
     */
    gt(value: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view where all items are greater than or equal to the given value.
     * If a comparator is not on this iterator or provided an error is thrown.
     *
     * @param value The value to compare against.
     * @param comparator An override for any existing comparison logic.
     */
    gte(value: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view where all items are less than the given value.
     * If a comparator is not on this iterator or provided an error is thrown.
     *
     * @param value The value to compare against.
     * @param comparator An override for any existing comparison logic.
     */
    lt(value: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view where all items are less than or equal to the given value.
     * If a comparator is not on this iterator or provided an error is thrown.
     *
     * @param value The value to compare against.
     * @param comparator An override for any existing comparison logic.
     */
    lte(value: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view of this iterator which does not include the items in the
     * given iterator.
     *
     * @param values The iterator with items to exclude.
     * @param equality An override for any existing equality logic.
     */
    exclude(source: IterateSourceType<T>, equality?: IterateEquals<T, any>): Iterate<T, K, S>;
    /**
     * Returns a view which has items which are in this iterator and the given
     * iterator.
     *
     * @param values The iterator with items to intersect with.
     * @param equality An override for any existing equality logic.
     */
    intersect(source: IterateSourceType<T>, equality?: IterateEquals<T, any>): Iterate<T, K, S>;
    /**
     * Returns a view which only contains unique items.
     *
     * @param equality An override for any existing equality logic.
     */
    unique(equality?: IterateEquals<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view which only contains items that have duplicates in this
     * iterator. For any items that occur more than twice you can exclude them
     * from the resulting view by passing `true` to `onlyOnce`.
     *
     * @param onlyOnce If the view should contain unique or all duplicates.
     * @param equality An override for any existing equality logic.
     */
    duplicates(onlyOnce?: boolean, equality?: IterateEquals<T, K>): Iterate<T, K, S>;
    /**
     * Returns a readonly view where mutations have no affect.
     */
    readonly(): Iterate<T, K, S>;
    /**
     * Returns a copy of the items in this view as a new iterator.
     */
    copy(): Iterate<T, K, Array<[K, T]>>;
    /**
     * Returns a view which requires a fully resolved array of items. The view
     * must keep track of the original item index in order to ensure removals
     * and replaces can be performed on the source.
     *
     * @param onResolve
     */
    viewResolved(onResolve: (items: Array<[K, T]>, handleAct: (item: T, itemKey: K, index: number) => IterateAction) => void): Iterate<T, K, S>;
    /**
     * Returns a view which has the items sorted.
     *
     * @param comparator An override for any existing comparison logic.
     */
    sorted(comparator?: IterateCompare<T, K>): Iterate<T, K, S>;
    /**
     * Returns an view of items in this iterator and presents them in a random order.
     */
    shuffle(passes?: number): Iterate<T, K, S>;
    /**
     * Returns an view of items in this iterator and presents them in reverse.
     */
    reverse(): Iterate<T, K, S>;
    /**
     * Returns an iterator where this iterator is the source and the returned
     * iterator is built from transformed items pulled from items in the source
     * of this iterator.
     *
     * @param transformer The function which transforms an item to another.
     * @param untransformer The function which untransforms a value when replace is called.
     */
    transform<W>(transformer: IterateCallback<T, K, S, W>, untransformer?: (replaceWith: W, current: W, item: T, key: K) => T): Iterate<W, K, S>;
    /**
     * Invokes the callback for each item in the source of this iterator. The
     * second argument in the callback is the reference to this iterator and
     * [[Iterate.stop]] can be called at anytime to cease iteration.
     *
     * @param callback The function to invoke for each item in this iterator.
     */
    iterate(callback: IterateCallback<T, K, S, any>): this;
    /**
     * Passes the result of the iteration to the given function if a truthy
     * result was passed to [[Iterate.stop]].
     *
     * @param getResult The function to pass the result to if it exists.
     */
    withResult(getResult: (result: any) => any): this;
    /**
     * This allows for...of loops to be used on this iterator.
     */
    [Symbol.iterator](): Iterator<T>;
    /**
     * Returns an iterator for the given array.
     *
     * @param items The array of items to iterate.
     * @returns A new iterator for the given array.
     */
    static entries<T, K>(items: Array<[K, T]>): Iterate<T, K, Array<[K, T]>>;
    /**
     * Returns an iterator for the given array.
     *
     * @param items The array of items to iterate.
     * @returns A new iterator for the given array.
     */
    static array<T>(items: T[]): Iterate<T, number, T[]>;
    /**
     * Returns an iterator for the keys and values specified. If the key and
     * value iterators don't have the same number of items, the returned iterator
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
    static zip<T, K, S extends IterateSourceTypeKey<T, K, S>>(keys: S, values: S): Iterate<T, K, S>;
    static zip<T, K>(keys: IterateSourceTypeKey<K, number>, values: IterateSourceTypeKey<T, number>): Iterate<T, K, any>;
    static zip<T, K>(keys: IterateSourceType<K>, values: IterateSourceType<T>): Iterate<T, K, any>;
    /**
     * Returns an iterator for any object which has an entries() iterable.
     *
     * @param hasEntries The object with the entries() iterable.
     * @param onRemove The function that should handle removing a key/value.
     * @param onReplace The function that should handle replacing a value.
     */
    static hasEntries<T, K, E extends HasEntries<T, K>>(hasEntries: E, onRemove?: (entries: E, key: K, value: T) => any, onReplace?: (entries: E, key: K, value: T, newValue: T) => any): Iterate<T, K, E>;
    /**
     * Returns an iterator for the given Map.
     *
     * @param items The Map of key-value pairs to iterate.
     * @returns A new iterator for the given Map.
     */
    static map<T, K>(items: Map<K, T>): Iterate<T, K, Map<K, T>>;
    /**
     * Returns an iterator for the given Set.
     *
     * @param items The Set of items to iterate.
     * @returns A new iterator for the given Set.
     */
    static set<T>(items: Set<T>): Iterate<T, T, Set<T>>;
    /**
     * Returns an iterator for any iterable. Because iterables don't support
     *
     * @param items The iterable collection.
     * @returns A new iterator for the given set.
     */
    static iterable<T, I extends Iterable<T>>(items: I): Iterate<T, number, I>;
    /**
     * Returns an iterator for the given object optionally checking the
     * `hasOwnProperty` function on the given object.
     *
     * @param items The object to iterate.
     * @param hasOwnProperty If `hasOwnProperty` should be checked.
     * @returns A new iterator for the given object.
     */
    static object<T>(items: {
        [key: string]: T;
    }, hasOwnProperty?: boolean): Iterate<T, string, {
        [key: string]: T;
    }>;
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
    static linked<N, T = any, K = T>(getValue: (node: N) => T, getNext: (node: N) => N | undefined | null, remove?: (node: N, prev: N) => any, replaceValue?: (node: N, value: T) => any, getKey?: (node: N) => K): (previousNode: N, strict?: boolean) => Iterate<T, K, N>;
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
    static tree<N, T = any, K = T>(getValue: (node: N) => T, getChildren: (node: N) => N[] | Iterate<N, any, any> | undefined | null, replaceValue?: (node: N, value: T) => any, getKey?: (node: N) => K): (startingNode: N, depthFirst?: boolean, strict?: boolean) => Iterate<T, K, N>;
    /**
     * Joins all the given sources into a single iterator where the items
     * returned are in the same order as passed to this function. If any items
     * are removed from the returned iterator they will be removed from the given
     * iterator if it supports removal.
     *
     * @param sources The sources to get iterators for to join.
     * @returns A new iterator for the given sources.
     */
    static join<T, K, S>(...sources: Iterate<T, K, S>[]): Iterate<T, K, S>;
    static join<S, T extends GetValueFor<S>, K extends GetKeyFor<S>>(...sources: S[]): Iterate<T, K, S>;
    static join<T, K>(...sources: IterateSourceTypeKey<T, K>[]): Iterate<T, K, any>;
    static join<T>(...sources: IterateSourceType<T>[]): Iterate<T, any, any>;
    static join(...sources: IterateSourceType<any>[]): Iterate<any, any, any>;
    /**
     * Returns a new iterator with no items.
     *
     * @returns A new iterator with no items.
     */
    static empty<T, K, S>(): Iterate<T, K, S>;
}
