# iteratez

A simple yet powerful iterator for simple and complex types. Out of the box you can iterate over arrays, objects, and trees, but you can provide iteration capabilites to your own code no matter how complex the type (dynamically calculated, etc).

The iterator is lazy, so you can chain "views" and iteration is not done until you perform "operations" or "modifiers" to the underlying source.

### Features

- Array, object, and tree iterators out of the box.
- Iteration is lazy, so iteration is only done when it absolutely needs to be.
- Some "operations" can exit early and cease iteration saving time and resources.
- When iterating, you can stop at any time.
- If the underlying source supports it, remove an item.
- If the underlying source supports it, replace an item.
- You can chain "views" which don't cause iteration until an "operation" or "modifier" are called.
  - `where` `map` `reverse` `exclude` `intersect` `sorted` `unique` `duplicates` `take` `skip` `drop` `append` `prepend` `gt` `gte` `lt` `lte`
- You can call "modifiers" to affect the underlying source.
  - `erase` `overwrite` `extract`
- You can call "operations" to iterate and produce a result.
  - `empty` `has` `contains` `first` `last` `count` `list` `object` `reduce` `min` `max` `iterate` `erase` `overwrite` `extract`
- Create your own iterator.

You can see all of these features in the examples below.

### Examples
The example is in Typescript, but iterator is available as `iz.Iterate` in JS

```typescript
import { Iterate } from 'iteratez';

// Creating an iterator
let source = Iterate.array([1, 5, 7, 9, 10]);
let source = Iterate.object({
  name: 'ClickerMonkey',
  age: 30
});
let source = yourSource.yourIteratorGenerator();

// ============ ITERATION ============ 

// Stop
source.iterate((item, iter) => {
  if (someCondition(item)) {
    iter.stop(42)
  }
}).withResult((result) => {
  // result = 42
  // function only called with previous iteration stopped with a value
});

// Remove
// - if the source is an array, it removes it from the array
// - if the source is an object, it removes the property
// - if the source is a tree, it removes it from the tree including it's children
// - otherwise, up to the custom source
source.iterate((item, iter) => {
  if (someCondition(item)) {
    iter.remove();
  }
});

// Replace
source.iterate((item, iter) => {
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
let array = source.list(); // T[]
let sameArray = source.list(existingArray); // T[]
let personById = source.object(item => item.id); // { [item.id]: item }
let sameObject = source.object(item => item.id, existingObject);
let min = source.min(Iterate.COMPARE_NUMBER); // T
let max = source.max(Iterate.COMPARE_NUMBER); // T

// ============ Modifiers ============ 
// These are at the end of a chain of views and they
// take the items in the current iterator and affects the
// underlying source.

source.erase(); // removes all items in iterator
source.where(x => x.id).erase(); // remove items without an ID

source.extract(); // does an erase and returns a new iterator with the removed items

source.overwrite(42); // replaces all items in iterator
source.where(x => x > 34).overwrite(12); // replace all numbers over 34 with 12

// ============ Views ============ 
// These are chainable, at the end if you call an operation it performs
// it only on the items in the iterator at that point. If you call
// a modifier then it changes the underlying source but only on the
// items in the view.

source.where(x => x.age > 0); // items that past test
source.map(x => x.name); // items mapped to a new type
source.reverse(); // items in reverse
source.exclude(anotherSource); // not shared items
source.intersect(anotherSource); // shared items
source.sorted(comparator?); // sorted by a comparator
source.unique(equality?); // unique items only
source.duplicates(onlyOnce?); // duplicate items only
source.take(10); // first 10 items
source.skip(5); // after first 5 items
source.drop(3); // ignore last 3
source.append(anotherSource); // union of two
source.prepend(anotherSource); // union in reverse order
source.gt(value, comparator?); // all items greater than value
source.gte(value, comparator?); // all items greater/equal to value
source.lt(value, comparator?); // all items less than value
source.lte(value, comparator?); // all items less/equal to value

// ============ Logic ============ 

// comparator is used for max/min/sorted/gt/gte/lt/lte
// also will set withEquality if not specified
source.withComparator((a, b) => number); 

// equality check used for contains/exclude/intersect/unique/duplicates
source.withEquality((a, b) => boolean);


// ============ Examples ============ 
// Views ending with an operation or modifier.

source.duplicates().has(); // has duplicates?
source.duplicates().erase(); // remove duplicates
source.where(x => x.age < 18).extract(); // remove < 18yo
source.sorted().skip(5).take(10).list(); // sort, get 5->15 as array

// Map to a new iterator, but support replacement
source.map<string>(
  // maps items to new type
  item => item.name, 
  // if replace is called un a subsequent iteration, how do we take the mapped value and apply it back to the original item?         
  (replaceWith, current, item) => {
    item.name = replaceWith;
  }
).iterate((name, iter) => {
  // Make all names uppercase in the most obtuse way possible
  iter.replace(name.toUpperCase());
});

// Iterate with a callback
source.iterate((item, iter) => {
  // iter.remove();
  // iter.stop(withResult);
  // iter.replace(newValue);
});

// Tree iteration
interface Node<T> {
  value: T
  children?: Node[]
}

// You create an iterator ready for nodes.
const treeIterator = Iterate.tree<Node<string>, string>(
  // get a value from a node
  node => node.value,
  // get children from a node (can return an array, another iterator, undefined, or null)
  node => node.children,
  // if replace is called, apply the value (this is optional)
  (node, value) => node.value = value
);

const head: Node<string> = ...

// Iterate depth-first and convert to an array
const depthFirstList = treeIterator(head).list();

// Iterate breadth-first and convert to an array
const breadthFirstList = treeIterator(head, false).list();


// CUSTOM ITERATOR
function getDateIterator (start: Date, max: number): Iterate<Date>
{
  return new Iterate<Date>(iter => 
  {
    // This function is called when an operation (ex: list) is called on iter
    // You should iterate over your items and respond to the action requested
    // In this example, if iterateNode returns false, stop all iteration
    const curr = new Date(start.getTime());

    for (let i = 0; i < max; i++)
    {
      // Dates are not immutable, don't want the iterator to mess this up.
      const copy = new Date(curr.getTime());

      switch (iter.act(copy)) 
      {
        // stop all iteration
        case IterateAction.Stop:
          return;

        // remove this value, and subsequentally all children from tree
        case IterateAction.Remove:
          // doesn't apply here, this is a dynamic set
          break;

        // replace the value
        case IterateAction.Replace:
          // doesn't apply here, this is a dynamic set
          break;
      }

      curr.setDate(curr.getDate() + 1);
    }
  });
}

// Get a list of 7 days starting 5 days from now.
const week5DaysFromNow = getDateIterator(new Date(), 100).skip(5).limit(7).list();
```

## TODO

- Async iterators