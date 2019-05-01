# iteratez

A powerful functional iterator, transformer, and mutator. 

Out of the box you can iterate over arrays, objects, trees, sets, maps, linked-lists, iterables - and you can provide iteration capabilites to your own code no matter how complex the type (dynamically calculated, etc).

The iterator is lazy, so you can chain "views" and iteration is not done until you perform "operations" or "mutations" to the underlying source.

## Features

- Array, object, tree, set, map, linked-list, and iterables out of the box.
- Iteration is lazy, so iteration is only done when it absolutely needs to be.
- Some [operations](#operations) can exit early and cease iteration saving time and resources.
- When iterating, you can stop at any time.
- If the underlying source supports it, [remove](#mutations) a value.
- If the underlying source supports it, [replace](#mutations) a value.
- You can chain [views](#views) which don't cause iteration until an [operation](#operations) or [mutation](#mutations) are called.
- You can call [mutations](#mutations) to affect the underlying source.
- You can call [operations](#operations) to iterate and produce a result.
- You can create a [reusable function](#reusable-function) to perform operations repeatedly.
- [Create your own iterator.](#custom-iterators)

You can see all of these features in the [examples](#examples) below.

### Views
Returns an iterator...
- `where`: for a subset of the values.
- `not`: for a subset of the values that don't pass test (opposite of where).
- `transform`: that transforms the values to another type.
- `reverse`: that iterates over the values in reverse order.
- `exclude`: that excludes values found in another iterator.
- `intersect`: that has common values in another iterator.
- `sorted`: that is sorted based on some comparison.
- `shuffle`: that is randomly ordered.
- `unique`: that has only unique values.
- `duplicates`: that has all the duplicate values.
- `readonly`: that ignores mutations.
- `keys`: only for the keys of the values (replace not supported).
- `values`: only for the values (new key is index based).
- `take`: that only iterates over the first X values.
- `skip`: that skips the first X values.
- `drop`: that drops off the last X values.
- `append`: that is the original iterator + one or more iterators specified.
- `prepend`: that is one or more iterators specified + the original iterator.
- `gt`: that only has values greater than a value.
- `gte`: that only has values greater than or equal to a value.
- `lt`: that only has values less than a value.
- `lte`: that only has values less than or equal to a value.
- `fork`: that is this, but allows a function to perform fork operations
- `split`: Splits the values into two iterators (pass/fail) based on a condition.
- `unzip`: Splits the view into two iterates (keys/values).

### Mutations
- `delete`: Removes values in the view from the source.
- `overwrite`: Replaces values in the view from the source with a constant replacement.
- `update`: Replace values in the view from the source with a dynamic replacement.
- `extract`: Removes values in the view from the source and returns a new iterator with the removed values.

### Operations
- `empty`: Determines if view contains zero values.
- `has`: Determines if the view contains any values.
- `contains`: Determines if the view contains a specific value.
- `first`: Gets the first value in the view.
- `last`: Gets the last value in the view.
- `count`: Counts the number of values in the view.
- `array`: Builds an array of the values in the view.
- `set`: Builds a Set of the values in the view.
- `object`: Builds an object of the values in the view.
- `entries`: Builds an array of `[key, value]` in the view.
- `map`: Builds a Map of the values and keys in the view.
- `group`: Builds an object of value arrays grouped by a value derived from each value.
- `reduce`: Reduces the values in the view down to a single value.
- `min`: Returns the minimum value in the view.
- `max`: Returns the maximum value in the view.
- `iterate`: Invokes a function for each value in the view.
- `copy`: Copies the values in the view and returns a new iterator.

### Comparison Logic
The following chainable functions define how values should be compared.

- `numbers`: Set number comparison logic to the iterator.
- `strings`: Set string comparison logic to the iterator.
- `dates`: Set date comparison logic to the iterator.
- `desc`: Reverses the comparison logic.
- `withEquality`: Set a custom equality function.
- `withComparator`: Set a custom comparison function.

### Other Functions
The following static functions exist to help iterate simple sources:

- `Iterate.array`: Iterates an array.
- `Iterate.object`: Iterates the properties of an object, optionally just the properties explicitly set on the object.
- `Iterate.tree`: Iterates trees.
- `Iterate.linked`: Iterates linked-lists.
- `Iterate.map`: Iterates Maps
- `Iterate.set`: Iterates Sets
- `Iterate.join`: Returns an iterator that iterates over one or more iterators.
- `Iterate.zip`: Combines a key iterator and value iterator into one.
- `Iterate.empty`: Iterates nothing.
- `Iterate.entries`: Iterates an array of `[key, value]` entries.
- `Iterate.iterable`: Iterates any collection that implements iterable.
- `Iterate.hasEntries`: Iterates any object which has the `entries()` iterator.

## Examples
The example is in Typescript, but iterator is available as `iz.Iterate` and the function whic dynamically returns an iterator is `iz.iterate` or simply `iz` in JS

```typescript
import iz, { Iterate } from 'iteratez';

// Creating an iterator
let source = iz([1, 5, 7, 9, 10]);
let source = iz({
  name: 'ClickerMonkey',
  age: 30
});
let source = iz('string'); // each character
let source = iz(...source); // anything iterable
let source = iz([['key', 'value'], ['key', 'value']]); // [key, value] tuples 
let source = iz(new Map()); // Map<K, V>
let source = iz(new Set()); // Set<T>
let source = iz(ReadonlyArray | ReadonlyMap | ReadonlySet | Int8Array | ...) // something that has entries() function
let source = Iterate.tree( ... )(head);
let source = Iterate.linked( ... )(head);
let source = yourSource.yourIteratorGenerator();

// ============ ITERATION ============ 

// Stop
source.each((value, key, iter) => {
  if (someCondition(value)) {
    iter.stop(42)
  }
}).withResult((result) => {
  // result = 42
  // function only called with previous iteration stopped with a value
});

// Remove
// - if the source is a sequential collection, it's removed from the sequence (array, object, etc)
// - if the source is a tree, it removes it from the tree including it's children
// - otherwise, up to the custom source
source.each((value, key, iter) => {
  if (someCondition(value)) {
    iter.remove();
  }
});

// Replace
source.each((value, key, iter) => {
  if (someCondition(value)) {
    iter.replace(replacement);
  }
});

// ============ Operations ============ 
// These are at the end of a chain of views

let empty = source.empty(); // boolean
let has = source.has(); // boolean
let contains = source.contains(2); // boolean
let first = source.first(); // T
let last = source.last(); // T
let count = source.count(); // number
let array = source.array(); // T[]
let array = source.array(dest); // T[]
let set = source.set(); // Set<T>
let object = source.object(value => value.id); // { [value.id]: value }
let object = source.object(value => value.id, dest);
let entries = source.entries(): // Array<[K, T]>
let map = source.map(); // Map<T, K>
let group = source.group(value => value.age); // { [age]: T[] }
let reduced = source.reduce(R, (T, R) => R); // R
let min = source.min(); // T
let max = source.max(); // T
let copy = source.copy(): // Iterate<T>

// ============ Mutations ============ 
// These are at the end of a chain of views and they
// take the values in the current iterator and affects the
// underlying source.

source.delete(); // removes all values in iterator
source.where(x => x.id).delete(); // remove values without an ID

source.extract(); // does a delete and returns a new iterator with the removed values

source.overwrite(42); // replaces all values in iterator
source.where(x => x > 34).overwrite(12); // replace all numbers over 34 with 12

source.update(x => x * 2); // multiply all numbers by 2

// ============ Views ============ 
// These are chainable, at the end if you call an operation it performs
// it only on the values in the iterator at that point. If you call
// a mutation then it changes the underlying source but only on the
// values in the view.

source.where(x => x.age > 0); // values that past test
source.not(x => x.age > 0); // values that don't pass test
source.transform(x => x.name); // values transformed to a new type
source.reverse(); // values in reverse
source.exclude(anotherSource); // not shared values
source.intersect(anotherSource); // shared values
source.sorted(comparator?); // sorted by a comparator
source.shuffle(times?); // randomly orders
source.unique(equality?); // unique values only
source.duplicates(onlyOnce?); // duplicate values only
source.readonly(); // all subsequent mutations are ignored
source.keys(); // just the keys (index based), delete mutation works
source.values(); // just the values (index based)
source.take(10); // first 10 values
source.skip(5); // after first 5 values
source.drop(3); // ignore last 3
source.append(anotherSource); // union of two
source.prepend(anotherSource); // union in reverse order
source.gt(value, comparator?); // all values greater than value
source.gte(value, comparator?); // all values greater/equal to value
source.lt(value, comparator?); // all values less than value
source.lte(value, comparator?); // all values less/equal to value
source.fork(f => f.where(x => !!x.male).delete()); // fork operation
source.split(x => x.male); // { pass, fail }
source.split(x => x.male, (pass, fail) => {}): // two iterators
source.unzip(); // { keys, values }
source.unzip((keys, values) => {}); // two iterators

// ============ Logic ============ 

// comparator is used for max/min/sorted/gt/gte/lt/lte
// also will set withEquality if not specified
source.withComparator((a, b) => number); 

// equality check used for contains/exclude/intersect/unique/duplicates
source.withEquality((a, b) => boolean);

// Pre-defined logic
source.numbers(ascending?, nullsFirst?); // number logic
source.strings(sensitive?, ascending?, nullsFirst?); // string logic
source.dates(equalityTimespan?, utc?, ascending?, nullsFirst?); // date logic
source.desc(); // reverse comparison logic


// ============ Examples ============ 
// Views ending with an operation or mutation.

source.duplicates().has(); // has duplicates?
source.duplicates().delete(); // remove duplicates
source.where(x => x.age < 18).extract(); // remove < 18yo
source.sorted().skip(5).take(10).array(); // sort, get 5->15 as array

// Map to a new iterator, but support replacement
source.transform<string>(
  // transforms values to new type
  value => value.name, 
  // if replace is called un a subsequent iteration, how do we take the transformed value and apply it back to the original value?         
  (replaceWith, current, value) => {
    value.name = replaceWith;
  }
).each((name, key, iter) => {
  // Make all names uppercase in the most obtuse way possible
  iter.replace(name.toUpperCase());
});

// Iterate with a callback
source.each((value, key, iter) => {
  // iter.remove();
  // iter.stop(withResult);
  // iter.replace(newValue);
});


// ============ Linked List ============ 
// You can have any structure you wish
interface Node<T> {
  value: T
  next?: Node<T>
}

const linkedIterator = Iterate.linked<Node<string>, string>(
  // get value from a node
  (node) => node.value,
  // get next node
  (node) => node.next,
  // remove the node (optional)
  (node, prev) => prev.next = node.next,
  // replace value (optional)
  (node, value) => node.value = value,
  // if you want a key different than the value, specify this
  (node) => node.value.length
);

const head: Node<string> = ...;

// for all nodes which have a value that passes the regex...
// - sort them by value (asending), remove the top 5
// - convert the unremoved unsorted nodes into an array
linkedIterator(head)
  .where(x => /regex/.test(x))
  .fork(f => f.strings().sorted().take(5).delete())
  .array();


// ============ Tree ============ 
interface Node<T> {
  value: T
  children?: Node<T>[]
}

// You create an iterator ready for nodes.
const treeIterator = Iterate.tree<Node<string>, string>(
  // get a value from a node
  (node) => node.value,
  // get children from a node (can return an array, another iterator, undefined, or null)
  (node) => node.children,
  // if replace is called, apply the value (this is optional)
  (node, value) => node.value = value
);

const head: Node<string> = ...

// Iterate depth-first and convert to an array
const depthFirstList = treeIterator(head).array();

// Iterate breadth-first and convert to an array
const breadthFirstList = treeIterator(head, false).array();

```

## Reusable Function
You can define a function which takes an iterator and performs any 
number of operations. You can optionally have it return a result.

```typescript
// Iterate.func<T, R, A, K, S>
// - T = value type
// - R = function return type
// - A = array of parameter types
// - K = desired key type (restricts the source that can be passed to the function)
// - S = desired source (type passed to function must match this type)

// A function without a result. If a word contains an a, uppercase the word
const fn = Iterate.func<string>(
  source => source
    .where(x => x.indexOf('a') !== -1)
    .update(x => x.toUpperCase())
);

// Any iterable source that has strings as values can be passed to function
const a = ['apple', 'bit', 'cat'];
fn(a);
// a = [APPLE, bit, CAT]

// A function with a result. If a word contains an a, uppercase it. Return the 
// number of changed words. The counting has to happen before the update
// since the update would make no values pass the where condition.
const fn = Iterate.func<string, number>(
  (source, setResult) => source
    .where(x => x.indexOf('a') !== -1)
    .count(setResult)
    .update(x => x.toUpperCase())
);

const a = ['apple', 'bit', 'cat'];
const b = fn(a); // 2
// a = [APPLE, bit, CAT]

// A function can have special paramters passed to it.
// Given an array of people, I want a subset of that array given
// a limit and offset.
const getPage = Iterate.func<Person, Person[], [number, number]>(
  (source, setResult, offset, limit) => source
    .skip(offset)
    .take(limit)
    .array(setResult)
);

const persons: Person[] = ...;
const page = getPage(persons, 5, 10);
// page = at most 10 people starting at index 5
```

## Custom Iterators
You can add your own iterators to pick up your own types. If you are not using 
TypeScript you can ignore and remove the types.

```typescript
// Lets assume we have a type which is a [Date, number] tuple
// which represents a range of dates.

type DateRange = [Date, number];

// First we create an iterator given the Range
// The generic arguments for Iterate<T, K, S> represent:
// - T = the value being iterated
// - K = the key type
// - S = the source type being iterated
function getDateIterator ([start, max]: DateRange)
{
  return new Iterate<Date, number, DateRange>(iter => 
  {
    // This function is called when an operation or mutation is called on iter
    // You should iterate over your values and respond to the action requested
    // In this example, if iterateNode returns false, stop all iteration
    const curr = new Date(start.getTime());

    for (let key = 0; key < max; key++)
    {
      // Dates are not immutable, don't want the iterator to mess this up.
      const value = new Date(curr.getTime());

      switch (iter.act(value, key)) 
      {
        // stop all iteration
        case IterateAction.STOP:
          return;

        // remove this value, and subsequentally all children from tree
        case IterateAction.REMOVE:
          // doesn't apply here, this is a dynamic set
          break;

        // replace the value
        case IterateAction.REPLACE:
          // doesn't apply here, this is a dynamic set
          break;
      }

      // the next date in the sequence
      curr.setDate(curr.getDate() + 1);
    }
  });
}

// Now that we have an iterator generator, if we wanted to we could 
// autmatically have the library detect my custom type and call my custom 
// iterator.
import { Generators } from 'iteratez';

// We need to detect our custom type. s is DateRange is just syntactical sugar
function isDateRange(s: any): s is DateRange {
  return Array.isArray(s) 
    && s.length === 2 
    && s[0] instanceof Date 
    && typeof s[1] === 'number'
  ;
}

// Add a generator detection to the beginning of the list
// It must return false if it's not a valid source.
Generators.unshift(s => isDateRange(s) ? getDateIterator(s) : false);

// Now when we do this...
const dateIterator = iz([new Date(), 10]);

// We have our iterator and can do anything we want with it.
const dates = dateIterator.array();

// BONUS!
// If we want the iz function to return a type Iterator (like Iterate<Date, number, DateRange>)
// we can add our own declaration file like this:

// <types/iteratez/index.d.ts>
import { Iterate } from 'iteratez';

declare module 'iteratez'
{
  // add the function overload
  export function iterate (range: DateRange): Iterate<Date, number, DateRange>
}
// </types/iteratez/index.d.ts>

// then instead of this everywhere:
import { iz } from 'iteratez';

const dateIterator = iz([new Date(), 3]); // Iterate<Date, number, DateRange> magic!
```
