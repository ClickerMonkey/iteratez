import { IterateAction } from "./IterateAction";
import { GetKeyFor, GetValueFor, HasEntries, IterateCallback, IterateCompare, IterateEquals, IterateFilter, IterateFunction, IterateFunctionExecute, IterateResult, IterateSource, IterateSourceType, IterateSourceTypeKey, IterateReset } from "./types";
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
export declare class Iterate<T, K, S> {
    /**
     * A result of the iteration passed to [[Iterate.stop]].
     */
    result: any;
    /**
     * The last action (if any) called on this iterator.
     */
    action: IterateAction;
    /**
     * The value to replace with the current value.
     */
    replaceWith: T;
    /**
     * The current callback passed to the iterator.
     */
    callback: IterateCallback<T, K, S, any>;
    /**
     * The source of iterable values. This allows the iteration over any type of
     * structure. The source must call the callback for each value and its
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
     * The function to invoke to passing a new source for iteration.
     */
    private handleReset;
    /**
     * Creates a new Iterate given a source.
     *
     * @param source The source of values to iterator.
     */
    constructor(source: IterateSource<T, K, S>, parent?: Iterate<T, any, any>);
    /**
     * The function which receives a new source to reset iteration.
     *
     * @package handleReset The function which takes the new source.
     */
    onReset(handleReset: IterateReset<S>): this;
    /**
     * Returns whether the iterator at this point supports a reset.
     */
    canReset(): boolean;
    /**
     * Sets a new source for iteration if supported. If the iterator doesn't
     * support resetting the source then an error will be thrown when `strict`
     * is true.
     *
     * @param source The new source for iteration.
     * @param strict If an error should be thrown if the iterator can't be reset.
     */
    reset(source: S, strict?: boolean): this;
    /**
     * Returns a clone of this iterator with the same source. This is necessary
     * if you want to iterate all or a portion of the source while already
     * iterating it (like a nested loop).
     */
    clone(): Iterate<T, K, S>;
    /**
     * Passes the given value to the iterator callback and returns the action
     * requested at this point in iteration.
     *
     * @param value The current value being iterated.
     */
    act(value: T, key: K): IterateAction;
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
     * Signals to the iterator source that the current value wants to be removed.
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
     * @param setResult A function to pass the result to.
     */
    empty(): boolean;
    empty(setResult: IterateResult<boolean>): this;
    /**
     * An operation that determines whether this iterator has a value.
     *
     * @param setResult A function to pass the result to.
     */
    has(): boolean;
    has(setResult: IterateResult<boolean>): this;
    /**
     * An operation that determines whether this iterator has the given value.
     *
     * @param value The value to search for.
     * @param setResult A function to pass the result to.
     */
    contains(value: T): boolean;
    contains(value: T, setResult: IterateResult<boolean>): this;
    /**
     * An operation that counts the number of values in the iterator.
     *
     * @param setResult A function to pass the count to.
     */
    count(): number;
    count(setResult: IterateResult<number>): this;
    /**
     * An operation that returns the first value in the iterator.
     *
     * @param setResult A function to pass the first value to.
     */
    first(): T;
    first(setResult: IterateResult<T>): this;
    /**
     * An operation that returns the last value in the iterator.
     *
     * @param setResult A function to pass the last value to.
     */
    last(): T;
    last(setResult: IterateResult<T>): this;
    /**
     * An operation that builds an array of values from the source.
     *
     * @param out The array to place the values in.
     * @param setResult A function to pass the array to.
     */
    array(out?: T[]): T[];
    array(out: T[], setResult: IterateResult<T[]>): this;
    array(setResult: IterateResult<T[]>): this;
    /**
     * An operation that builds an array of [key, value] entries from this view.
     *
     * @param out The array to place the entries in.
     * @param setResult A function to pass the entries to.
     */
    entries(out?: Array<[K, T]>): Array<[K, T]>;
    entries(out: Array<[K, T]>, setResult: IterateResult<Array<[K, T]>>): this;
    entries(setResult: IterateResult<Array<[K, T]>>): this;
    /**
     * An operation that builds an object of values from the iterator keyed by a
     * result returned by a `getKey` function.
     *
     * @param getKey The function which returns the key of the object.
     * @param out The object to place the values in.
     * @param setResult A function to pass the object to.
     */
    object<O = {
        [key: string]: T;
    }>(getKey: (value: T) => keyof O, out?: O): O;
    object<O = {
        [key: string]: T;
    }>(getKey: (value: T) => keyof O, out: O, setResult: IterateResult<O>): this;
    object<O = {
        [key: string]: T;
    }>(getKey: (value: T) => keyof O, setResult: IterateResult<O>): this;
    /**
     * An operation that builds a Set of values from the source.
     *
     * @param out The Set to place the values in.
     * @param setResult A function to pass the set to.
     */
    set(out?: Set<T>): Set<T>;
    set(out: Set<T>, setResult: IterateResult<Set<T>>): this;
    set(setResult: IterateResult<Set<T>>): this;
    /**
     * An operation that builds a Map of key-value pairs from the source.
     *
     * @param out The Map to place the values in.
     * @param setResult A function to pass the map to.
     */
    map(out?: Map<K, T>): Map<K, T>;
    map(out: Map<K, T>, setResult: IterateResult<Map<K, T>>): this;
    map(setResult: IterateResult<Map<K, T>>): this;
    /**
     * An operation that returns an object with arrays of values where the
     * property of the object is a key returned by a function.
     *
     * @param by A function to get the key from a value.
     * @param out The object to add groups to.
     * @param setResult A function to pass the groups to.
     */
    group<G extends {
        [by: string]: T[];
    }>(by: (value: T) => any, out?: G): G;
    group<G extends {
        [by: string]: T[];
    }>(by: (value: T) => any, out: G, setResult: IterateResult<G>): this;
    group<G extends {
        [by: string]: T[];
    }>(by: (value: T) => any, setResult: IterateResult<G>): this;
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
    reduce<R>(initial: R, reducer: (value: T, reduced: R) => R): R;
    reduce<R>(initial: R, reducer: (value: T, reduced: R) => R, setResult: IterateResult<R>): this;
    /**
     * An operation that returns the minimum value in this iterator. If this
     * iterator is empty null is returned.
     *
     * @param setResult A function to pass the minimum value to.
     */
    min(): T;
    min(setResult: IterateResult<T>): this;
    /**
     * An operation that returns the maximum value in this iterator. If this
     * iterator is empty null is returned.
     *
     * @param setResult A function to pass the maximum value to.
     */
    max(): T;
    max(setResult: IterateResult<T>): this;
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
    changes(onAdd: IterateCallback<T, K, S, any>, onRemove: IterateCallback<T, K, S, any>, onPresent: IterateCallback<T, K, S, any>, getIdentifier?: IterateCallback<T, K, S, any>): this;
    /**
     * A mutation which removes values in this iterator from the source.
     */
    delete(): this;
    /**
     * A mutation which removes values in this iterator from the source and
     * returns a new iterator with the removed values.
     */
    extract(): Iterate<T, K, Array<[K, T]>>;
    extract(setResult: IterateResult<Iterate<T, K, Array<[K, T]>>>): this;
    /**
     * A mutation which replaces values in this view with a single given value.
     *
     * @param replacement The value to replace for all the values in this iterator.
     */
    overwrite(replacement: T): this;
    /**
     * A mutation which replaces values in this view with a dynamically created one.
     *
     * @param updater A function which given a value and key returns a replacement value.
     */
    update(updater: (value: T, key: K) => T): this;
    /**
     * Forks this view into another and returns a reference to this view.
     * This allows chaining of multiple views which each perform a different
     * operation or mutation. Forks are executed sequentially, so if one fork
     * performs mutations the subsequent forks will see the mutated values.
     *
     * @param forker A function which takes the iterator at this point and
     *    performs any mutations and operations.
     */
    fork(forker: (fork: this) => any): this;
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
     * @param shouldAct Based on the data and the value, should we act on it?
     * @param afterAct What to do if the value was acted on.
     * @param afterSkip What to do if the value was NOT acted on.
     */
    view<D>(getData: () => D, shouldAct: (data: D, value: T, key: K) => any, afterAct?: (data: D, value: T, key: K, iter: Iterate<T, K, S>) => void, afterSkip?: (data: D, value: T, key: K, iter: Iterate<T, K, S>) => void): Iterate<T, K, S>;
    /**
     * Returns a view that only returns a maximum number of values.
     *
     * @param amount The maximum number of values to return.
     */
    take(amount: number): Iterate<T, K, S>;
    /**
     * Returns a view that skips the given number of values from the values
     * in this iterator.
     *
     * @param amount The number of values to skip.
     */
    skip(amount: number): Iterate<T, K, S>;
    /**
     * Returns a view that drops the given number of values from the end of the
     * values in this iterator.
     *
     * @param amount The number of values to drop from the end.
     */
    drop(amount: number): Iterate<T, K, S>;
    /**
     * Returns a view thats values are the values in this iterator followed
     * by the values in the given iterators.
     *
     * @param iterators The iterators to append after this one.
     */
    append(...sources: S[]): Iterate<T, K, S>;
    append(...sources: IterateSourceTypeKey<T, K>[]): Iterate<T, K, any>;
    append(...sources: IterateSourceType<T>[]): Iterate<T, any, any>;
    append(...sources: IterateSourceType<any>[]): Iterate<any, any, any>;
    /**
     * Returns a view thats values are the values in the given iterators
     * followed by the values in this iterator.
     *
     * @param iterators The iterators to prepend before this one.
     */
    prepend(...sources: S[]): Iterate<T, K, S>;
    prepend(...sources: IterateSourceTypeKey<T, K>[]): Iterate<T, K, any>;
    prepend(...sources: IterateSourceType<T>[]): Iterate<T, any, any>;
    prepend(...sources: IterateSourceType<any>[]): Iterate<any, any, any>;
    /**
     * Returns a view of values in this iterator which pass a `where` function.
     *
     * @param where The function which determines if a value should be iterated.
     */
    where(where: IterateFilter<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view of values in this iterator which do NOT pass a `not` function.
     *
     * @param not The function which determines if a value should be iterated.
     */
    not(not: IterateFilter<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view where all values are greater than the given value.
     * If a comparator is not on this iterator or provided an error is thrown.
     *
     * @param threshold The value to compare against.
     * @param comparator An override for any existing comparison logic.
     */
    gt(threshold: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view where all values are greater than or equal to the given value.
     * If a comparator is not on this iterator or provided an error is thrown.
     *
     * @param threshold The value to compare against.
     * @param comparator An override for any existing comparison logic.
     */
    gte(threshold: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view where all values are less than the given value.
     * If a comparator is not on this iterator or provided an error is thrown.
     *
     * @param threshold The value to compare against.
     * @param comparator An override for any existing comparison logic.
     */
    lt(threshold: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view where all values are less than or equal to the given value.
     * If a comparator is not on this iterator or provided an error is thrown.
     *
     * @param threshold The value to compare against.
     * @param comparator An override for any existing comparison logic.
     */
    lte(threshold: T, comparator?: IterateCompare<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view of this iterator which does not include the values in the
     * given iterator.
     *
     * @param source The source of values to exclude.
     * @param equality An override for any existing equality logic.
     */
    exclude(source: IterateSourceType<T>, equality?: IterateEquals<T, any>): Iterate<T, K, S>;
    /**
     * Returns a view which has values which are in this iterator and the given
     * iterator.
     *
     * @param source The source of values to intersect with.
     * @param equality An override for any existing equality logic.
     */
    intersect(source: IterateSourceType<T>, equality?: IterateEquals<T, any>): Iterate<T, K, S>;
    /**
     * Returns a view which only contains unique values.
     *
     * @param equality An override for any existing equality logic.
     */
    unique(equality?: IterateEquals<T, K>): Iterate<T, K, S>;
    /**
     * Returns a view which only contains values that have duplicates in this
     * iterator. For any values that occur more than twice you can exclude them
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
     * Returns a copy of the values in this view as a new iterator.
     */
    copy(): Iterate<T, K, Array<[K, T]>>;
    /**
     * Returns a view which requires a fully resolved array of values. The view
     * must keep track of the original value index in order to ensure removals
     * and replaces can be performed on the source.
     *
     * @param onResolve
     */
    viewResolved(onResolve: (values: Array<[K, T]>, handleAct: (value: T, key: K, index: number) => IterateAction) => void): Iterate<T, K, S>;
    /**
     * Returns a view which has the values sorted.
     *
     * @param comparator An override for any existing comparison logic.
     */
    sorted(comparator?: IterateCompare<T, K>): Iterate<T, K, S>;
    /**
     * Returns an view of values in this iterator and presents them in a random order.
     */
    shuffle(passes?: number): Iterate<T, K, S>;
    /**
     * Returns an view of values in this iterator and presents them in reverse.
     */
    reverse(): Iterate<T, K, S>;
    /**
     * Returns an iterator where this iterator is the source and the returned
     * iterator is built from transformed values pulled from values in the source
     * of this iterator.
     *
     * @param transformer The function which transforms a value to another type.
     * @param untransformer The function which untransforms a value when replace is called.
     */
    transform<W>(transformer: IterateCallback<T, K, S, W>, untransformer?: (replaceWith: W, current: W, value: T, key: K) => T): Iterate<W, K, S>;
    /**
     * Invokes the callback for each value in the source of this iterator. The
     * second argument in the callback is the reference to this iterator and
     * [[Iterate.stop]] can be called at anytime to cease iteration.
     *
     * @param callback The function to invoke for each value in this iterator.
     */
    each(callback: IterateCallback<T, K, S, any>): this;
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
     * @param values The array of values to iterate.
     * @returns A new iterator for the given array.
     */
    static entries<T, K>(values?: Array<[K, T]>): Iterate<T, K, Array<[K, T]>>;
    /**
     * Returns an iterator for the given array.
     *
     * @param values The array of values to iterate.
     * @returns A new iterator for the given array.
     */
    static array<T>(values?: T[]): Iterate<T, number, T[]>;
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
    static zip<J, K extends GetValueFor<J>, S, T extends GetValueFor<S>>(keySource: J, valueSource: S): Iterate<T, K, [J, S]>;
    /**
     * Returns an iterator for any object which has an entries() iterable.
     *
     * @param hasEntries The object with the entries() iterable.
     * @param onRemove The function that should handle removing a key/value.
     * @param onReplace The function that should handle replacing a value.
     */
    static hasEntries<T, K, E extends HasEntries<T, K>>(hasEntries?: E, onRemove?: (entries: E, key: K, value: T) => any, onReplace?: (entries: E, key: K, value: T, newValue: T) => any): Iterate<T, K, E>;
    /**
     * Returns an iterator for the given Map.
     *
     * @param values The Map of key-value pairs to iterate.
     * @returns A new iterator for the given Map.
     */
    static map<T, K>(values?: Map<K, T>): Iterate<T, K, Map<K, T>>;
    /**
     * Returns an iterator for the given Set.
     *
     * @param values The Set of values to iterate.
     * @returns A new iterator for the given Set.
     */
    static set<T>(values?: Set<T>): Iterate<T, T, Set<T>>;
    /**
     * Returns an iterator for any iterable. Because iterables don't support
     *
     * @param values The iterable collection.
     * @returns A new iterator for the given set.
     */
    static iterable<T>(values: Iterable<T>): Iterate<T, number, Iterable<T>>;
    /**
     * Returns an iterator for the given object optionally checking the
     * `hasOwnProperty` function on the given object.
     *
     * @param values The object to iterate.
     * @param hasOwnProperty If `hasOwnProperty` should be checked.
     * @returns A new iterator for the given object.
     */
    static object<T>(values: {
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
    static linked<N, T = any, K = T>(getValue: (node: N) => T, getNext: (node: N) => N | undefined | null, remove?: (node: N, prev: N) => any, replaceValue?: (node: N, value: T) => any, getKey?: (node: N) => K): (previousNode?: N, strict?: boolean) => Iterate<T, K, N>;
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
    static tree<N, T = any, K = T>(getValue: (node: N) => T, getChildren: (node: N) => N[] | Iterate<N, any, any> | undefined | null, replaceValue?: (node: N, value: T) => any, getKey?: (node: N) => K): (startingNode?: N, depthFirst?: boolean, strict?: boolean) => Iterate<T, K, N>;
    /**
     * Joins all the given sources into a single iterator where the values
     * returned are in the same order as passed to this function. If any values
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
     * Returns a new iterator with no values.
     *
     * @returns A new iterator with no values.
     */
    static empty<T, K, S>(): Iterate<T, K, S>;
    /**
     * Generates a reusable function which takes a source and performs a
     * pre-defined set of views, operations, and mutations.
     *
     * @param execute The function which performs the function.
     */
    static func<T = any, R = void, A extends any[] = [], K = any, S = any>(execute: IterateFunctionExecute<T, R, A, K, S>): IterateFunction<T, R, A, K, S>;
}
