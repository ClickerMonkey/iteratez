# iteratez

A powerful functional iterator, transformer, and mutator. 

Out of the box you can iterate over arrays, objects, trees, sets, maps, linked-lists, iterables - and you can provide iteration capabilites to your own code no matter how complex the type (dynamically calculated, etc).

The iterator is lazy, so you can chain "views" and iteration is not done until you perform "operations" or "mutations" to the underlying source.

## Features

- Array, object, tree, set, map, linked-list, and iterables out of the box.
- Iteration is lazy, so iteration is only done when it absolutely needs to be.
- Some [operations](#operations) can exit early and cease iteration saving time and resources.
- When iterating, you can stop at any time.
- If the underlying source supports it, [remove](#mutations) an item.
- If the underlying source supports it, [replace](#mutations) an item.
- You can chain [views](#views) which don't cause iteration until an [operation](#operations) or [mutation](#mutations) are called.
- You can call [mutations](#mutations) to affect the underlying source.
- You can call [operations](#operations) to iterate and produce a result.
- [Create your own iterator.](#custom-iterators)

You can see all of these features in the [examples](#examples) below.

### Views
Returns an iterator...
- `where`: for a subset of the items.
- `not`: for a subset of the items that don't pass test (opposite of where).
- `transform`: that transforms the items to another type.
- `reverse`: that iterates over the items in reverse order.
- `exclude`: that excludes items found in another iterator.
- `intersect`: that has common items in another iterator.
- `sorted`: that is sorted based on some comparison.
- `shuffle`: that is randomly ordered.
- `unique`: that has only unique values.
- `duplicates`: that has all the duplicate values.
- `readonly`: that ignores mutations.
- `keys`: only for the keys of the items (replace not supported).
- `values`: only for the values of the items (new key is index based).
- `take`: that only iterates over the first X items.
- `skip`: that skips the first X items.
- `drop`: that drops off the last X items.
- `append`: that is the original iterator + one or more iterators specified.
- `prepend`: that is one or more iterators specified + the original iterator.
- `gt`: that only has items greater than a value.
- `gte`: that only has items greater than or equal to a value.
- `lt`: that only has items less than a value.
- `lte`: that only has items less than or equal to a value.
- `fork`: that is this, but allows a function to perform fork operations
- `split`: Splits the items into two iterators (pass/fail) based on a condition.
- `unzip`: Splits the view into two iterates (keys/values).

### Mutations
- `delete`: Removes items in the view from the source.
- `overwrite`: Replaces items in the view from the source.
- `extract`: Removes items in the view from the source and returns a new iterator with the removed items.

### Operations
- `empty`: Determines if view contains zero items.
- `has`: Determines if the view contains any items.
- `contains`: Determines if the view contains a specific item.
- `first`: Gets the first item in the view.
- `last`: Gets the last item in the view.
- `count`: Counts the number of items in the view.
- `array`: Builds an array of the items in the view.
- `set`: Builds a Set of the items in the view.
- `object`: Builds an object of the items in the view.
- `entries`: Builds an array of `[key, value]` in the view.
- `map`: Builds a Map of the items and keys in the view.
- `group`: Builds an object of item arrays grouped by a value derived from each item.
- `reduce`: Reduces the items in the view down to a single value.
- `min`: Returns the minimum item in the view.
- `max`: Returns the maximum item in the view.
- `iterate`: Invokes a function for each item in the view.
- `copy`: Copies the items in the view and returns a new iterator.

### Comparison Logic
The following chainable functions define how items should be compared.

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
source.each((item, itemKey, iter) => {
  if (someCondition(item)) {
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
source.each((item, itemKey, iter) => {
  if (someCondition(item)) {
    iter.remove();
  }
});

// Replace
source.each((item, itemKey, iter) => {
  if (someCondition(item)) {
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
let object = source.object(item => item.id); // { [item.id]: item }
let object = source.object(item => item.id, dest);
let entries = source.entries(): // Array<[K, T]>
let map = source.map(); // Map<T, K>
let group = source.group(item => item.age); // { [age]: T[] }
let reduced = source.reduce(R, (T, R) => R); // R
let min = source.min(); // T
let max = source.max(); // T
let copy = source.copy(): // Iterate<T>

// ============ Mutations ============ 
// These are at the end of a chain of views and they
// take the items in the current iterator and affects the
// underlying source.

source.delete(); // removes all items in iterator
source.where(x => x.id).delete(); // remove items without an ID

source.extract(); // does a delete and returns a new iterator with the removed items

source.overwrite(42); // replaces all items in iterator
source.where(x => x > 34).overwrite(12); // replace all numbers over 34 with 12

// ============ Views ============ 
// These are chainable, at the end if you call an operation it performs
// it only on the items in the iterator at that point. If you call
// a mutation then it changes the underlying source but only on the
// items in the view.

source.where(x => x.age > 0); // items that past test
source.not(x => x.age > 0); // items that don't pass test
source.transform(x => x.name); // items transformed to a new type
source.reverse(); // items in reverse
source.exclude(anotherSource); // not shared items
source.intersect(anotherSource); // shared items
source.sorted(comparator?); // sorted by a comparator
source.shuffle(times?); // randomly orders
source.unique(equality?); // unique items only
source.duplicates(onlyOnce?); // duplicate items only
source.readonly(); // all subsequent mutations are ignored
source.keys(); // just the keys (index based), delete mutation works
source.values(); // just the values (index based)
source.take(10); // first 10 items
source.skip(5); // after first 5 items
source.drop(3); // ignore last 3
source.append(anotherSource); // union of two
source.prepend(anotherSource); // union in reverse order
source.gt(value, comparator?); // all items greater than value
source.gte(value, comparator?); // all items greater/equal to value
source.lt(value, comparator?); // all items less than value
source.lte(value, comparator?); // all items less/equal to value
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
  // transforms items to new type
  item => item.name, 
  // if replace is called un a subsequent iteration, how do we take the transformed value and apply it back to the original item?         
  (replaceWith, current, item) => {
    item.name = replaceWith;
  }
).each((name, key, iter) => {
  // Make all names uppercase in the most obtuse way possible
  iter.replace(name.toUpperCase());
});

// Iterate with a callback
source.each((item, key, iter) => {
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
  .list();


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
    // You should iterate over your items and respond to the action requested
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
// we can add our own iteratez.d.ts file like this:

// <iteratez.d.ts>
import { Iterate } from 'iteratez';

export * from 'iteratez';

declare module 'iteratez'
{
  // add the function overload
  export function iterate (range: DateRange): Iterate<Date, number, DateRange>
}
// </iteratez.d.ts>

// then instead of this everywhere:
import iz from 'iteratez';
// we can do this
import iz from './path/to/my/iteratez.d';

const dateIterator = iz([new Date(), 3]); // Iterate<Date, number, DateRange> magic!
```
