// import { describe, it, expect } from 'jest';
import { Iterate } from '../Iterate';

// tslint:disable: no-magic-numbers

describe('Iterate', () => {

  it('remove', () =>
  {
    const a: number[] = [1, 2, 3, 4];

    Iterate.array( a )
      .iterate((n, iterator) => {
        if (n % 2 === 0) {
          iterator.remove();
        }
      })
    ;

    expect( a ).toEqual( [1, 3] );
  })

  it('empty', () =>
  {
    expect( Iterate.array<number>( [] ).empty() ).toBeTruthy();
    expect( Iterate.array( [1, 2] ).empty() ).toBeFalsy();
    expect( Iterate.object<number>( {} ).empty() ).toBeTruthy();
    expect( Iterate.object( {x: 2} ).empty() ).toBeFalsy();
  })

  it('empty where', () =>
  {
    const isEven = (x: number) => x % 2 === 0;

    expect( Iterate.array<number>( [] ).where( isEven ).empty() ).toBeTruthy();
    expect( Iterate.array( [1, 3] ).where( isEven ).empty() ).toBeTruthy();
    expect( Iterate.array( [1, 2] ).where( isEven ).empty() ).toBeFalsy();
    expect( Iterate.object<number>( {} ).where( isEven ).empty() ).toBeTruthy();
    expect( Iterate.object( {x: 1} ).where( isEven ).empty() ).toBeTruthy();
    expect( Iterate.object( {x: 1, y: 2} ).where( isEven ).empty() ).toBeFalsy();
    expect( Iterate.object( {x: 1, y: 3} ).where( isEven ).empty() ).toBeTruthy();
  })

  it('has', () =>
  {
    expect( Iterate.array([]).has() ).toBeFalsy();
    expect( Iterate.empty().has() ).toBeFalsy();
    expect( Iterate.array([1]).has() ).toBeTruthy();
    expect( Iterate.object({}).has() ).toBeFalsy();
    expect( Iterate.object({x: true}).has() ).toBeTruthy();
  });

  it('has where', () =>
  {
    const isEven = (x: number) => x % 2 === 0;

    expect( Iterate.array([1]).where(isEven).has() ).toBeFalsy();
    expect( Iterate.array([1, 2]).where(isEven).has() ).toBeTruthy();
    expect( Iterate.object({x: 1 }).where(isEven).has() ).toBeFalsy();
    expect( Iterate.object({x: 1, y: 2}).where(isEven).has() ).toBeTruthy();
  });

  it('hasDuplicates', () =>
  {
    expect( Iterate.array([]).duplicates().has() ).toBeFalsy();
    expect( Iterate.object({}).duplicates().has() ).toBeFalsy();
    expect( Iterate.empty().duplicates().has() ).toBeFalsy();
    expect( Iterate.array([1, 2, 3, 4, 5]).duplicates().has() ).toBeFalsy();
    expect( Iterate.array([1, 2, 3, 4, 5, 1]).duplicates().has() ).toBeTruthy();
    expect( Iterate.array([1, 1]).duplicates().has() ).toBeTruthy();
    expect( Iterate.array([0, 1, 1]).duplicates().has() ).toBeTruthy();
  });

  it('contains', () =>
  {
    expect( Iterate.array([1, 2, 3, 4]).contains(1) ).toBeTruthy();
    expect( Iterate.array([1, 2, 3, 4]).contains(5) ).toBeFalsy();
  });

  it('first', () =>
  {
    expect( Iterate.array([1, 2, 3]).first() ).toEqual(1);
    expect( Iterate.array([1, 2, 3]).reverse().first() ).toEqual(3);
    expect( Iterate.array([2, 3, 1]).withComparator(Iterate.COMPARE_NUMBER).sorted().first() ).toEqual(1);
  });

  it('last', () =>
  {
    expect( Iterate.array([1, 2, 3]).last() ).toEqual(3);
    expect( Iterate.array([1, 2, 3]).reverse().last() ).toEqual(1);
    expect( Iterate.array([2, 3, 1]).sorted(Iterate.COMPARE_NUMBER).first() ).toEqual(1);
  });

  it('count', () =>
  {
    expect( Iterate.array([1, 2, 3]).count() ).toEqual(3);
    expect( Iterate.array([1, 2, 3]).where(n => n % 2 === 0).count() ).toEqual(1);
  });

  it('min', () =>
  {
    expect( Iterate.array([1, 0, 3, 2]).min(Iterate.COMPARE_NUMBER) ).toEqual(0);
    expect( Iterate.array([1, 0, 3, 2]).desc(Iterate.COMPARE_NUMBER).min() ).toEqual(3);
  });

  it('max', () =>
  {
    expect( Iterate.array([1, 0, 3, 2]).max(Iterate.COMPARE_NUMBER) ).toEqual(3);
    expect( Iterate.array([1, 0, 3, 2]).desc(Iterate.COMPARE_NUMBER).max() ).toEqual(0);
  });

  it('delete', () =>
  {
    const a = Iterate.array([1, 2, 3, 4]);
    a.delete();
    expect( a.array() ).toEqual( [] );

    const b = Iterate.array([1, 2, 0, 3]);
    b.where(x => x % 2 === 0).delete();
    expect (b.array() ).toEqual( [1, 3] );

    const c = Iterate.array([1, 1, 2, 3, 4, 1]);
    c.duplicates(false).delete();
    expect( c.array() ).toEqual( [1, 2, 3, 4] );
  });

  it('overwrite', () =>
  {
    const a = Iterate.array([1, 2, 3, 4]);
    a.overwrite(0);
    expect( a.array() ).toEqual( [0, 0, 0, 0] );

    const b = Iterate.array([1, 2, 0, 3]);
    b.where(x => x % 2 === 0).overwrite(0);
    expect (b.array() ).toEqual( [1, 0, 0, 3] );

    const c = Iterate.array([1, 1, 2, 3, 4, 1]);
    c.duplicates(false).overwrite(0);
    expect( c.array() ).toEqual( [1, 0, 2, 3, 4, 0] );
  });

  it('reverse', () =>
  {
    const a: number[] = [1, 2, 3, 4];
    const out: number[] = Iterate.array( a ).reverse().array();

    expect( out ).toEqual( [4, 3, 2, 1] );
  })

  it('reduce', () =>
  {
    const a: number[] = [1, 2, 3, 4, 5];
    const sum: number = Iterate.array( a ).reduce( 0, (item, current) => current + item );

    expect( sum ).toBe( 15 );
  })

  it('where', () =>
  {
    const a: number[] = [1, 2, 3, 4];
    const isEven = (x: number) => x % 2 === 0;
    const even: number[] = Iterate.array( a ).where( isEven ).array();

    expect( even ).toEqual( [2, 4] );
  })

  it('not', () =>
  {
    const a: number[] = [1, 2, 3, 4];
    const isEven = (x: number) => x % 2 === 0;
    const even: number[] = Iterate.array( a ).not( isEven ).array();

    expect( even ).toEqual( [1, 3] );
  })

  it('transform', () =>
  {
    const a: number[] = [1, 2, 3, 4];
    const transformed: string[] = Iterate.array( a )
      .transform<string>(item => 'x' + item)
      .array();

    expect( transformed ).toEqual( ['x1', 'x2', 'x3', 'x4'] );
  })

  it('join', () =>
  {
    const a: number[] = [1, 2, 3];
    const b = {x: 4, y: 5, z: 6};
    const c: number[] = Iterate.join( Iterate.array( a ), Iterate.object( b ) ).array();

    expect( c ).toEqual( [1, 2, 3, 4, 5, 6] );
  })

  it('skip', () =>
  {
    const a: number[] = [1, 2, 3, 4, 5];
    const b: number[] = Iterate.array( a ).skip( 2 ).array();

    expect( b ).toEqual( [3, 4, 5] );

    expect( Iterate.array([1, 5, 2, 3, 4, 6]).where(x => x % 2).skip(1).array() ).toEqual( [5, 3] );
  })

  it('take', () =>
  {
    const a: number[] = [1, 2, 3, 4];
    const b: number[] = Iterate.array( a ).take( 3 ).array();

    expect( b ).toEqual( [1, 2, 3] );

    expect( Iterate.array([1, 5, 2, 3, 4]).sorted(Iterate.COMPARE_NUMBER).take(3).array() ).toEqual( [1, 2, 3] );
  })

  it('drop', () =>
  {
    const a: number[] = [1, 2, 3, 4];
    const b: number[] = [1, 2, 3, 4, 5, 6];

    expect( Iterate.array(a).drop(2).array() ).toEqual([1, 2]);

    expect( Iterate.array(b).drop(2).array() ).toEqual([1, 2, 3, 4]);
  });

  it('skip take', () =>
  {
    const a: number[] = [1, 2, 3, 4, 5, 6];
    const b: number[] = Iterate.array( a ).skip( 2 ).take( 2 ).array();

    expect( b ).toEqual( [3, 4] );
  })

  it('skip take append', () =>
  {
    const a: number[] = [1, 2, 3, 4, 5];
    const iter = Iterate.array( a );
    const b: number[] = iter.skip( 3 ).append(iter.take( 1 )).array();

    expect( b ).toEqual( [4, 5, 1] );
  })

  it('skip take prepend', () =>
  {
    const a: number[] = [1, 2, 3, 4, 5];
    const iter = Iterate.array( a );
    const b: number[] = iter.skip( 3 ).prepend(iter.take( 1 )).array();

    expect( b ).toEqual( [1, 4, 5] );
  })

  it('for...of', () =>
  {
    const iter = Iterate.array([1, 2, 3, 4, 5]);
    const iterated = [];

    for (const num of iter) {
      iterated.push(num);
    }

    expect(iterated).toEqual([1, 2, 3, 4, 5]);
  });

  it('gt', () =>
  {
    expect( Iterate.array([1, 2, 3, 4, 5]).gt(3, Iterate.COMPARE_NUMBER).array() ).toEqual( [4, 5] );
  });

  it('gte', () =>
  {
    expect( Iterate.array([1, 2, 3, 4, 5]).gte(3, Iterate.COMPARE_NUMBER).array() ).toEqual( [3, 4, 5] );
  });

  it('lt', () =>
  {
    expect( Iterate.array([1, 2, 3, 4, 5]).lt(3, Iterate.COMPARE_NUMBER).array() ).toEqual( [1, 2] );
  });

  it('lte', () =>
  {
    expect( Iterate.array([1, 2, 3, 4, 5]).lte(3, Iterate.COMPARE_NUMBER).array() ).toEqual( [1, 2, 3] );
  });

  it('exclude', () =>
  {
    expect( Iterate.array([1, 2, 3, 4]).exclude(Iterate.array([2, 4])).array() ).toEqual( [1, 3] );
  });

  it('intersect', () =>
  {
    expect( Iterate.array([1, 2, 3, 4]).intersect(Iterate.array([2, 4, 5])).array() ).toEqual( [2, 4] );
  });

  it('unique', () =>
  {
    expect( Iterate.array([1, 2, 3, 2, 1, 4, 2, 5]).unique().array() ).toEqual( [1, 2, 3, 4, 5] );
  });

  it('sorted', () =>
  {
    const a = Iterate.array([1, 6, 2, 3, 8, 7, 0, 3]);
    const aSorted = a.sorted(Iterate.COMPARE_NUMBER);

    expect( aSorted.array() ).toEqual( [0, 1, 2, 3, 3, 6, 7, 8] );
    expect( aSorted.take(3).array() ).toEqual( [0, 1, 2] );
    aSorted.take(3).delete();
    expect( a.array() ).toEqual( [6, 3, 8, 7, 3] );

    const b = Iterate.array([1, 6, 2, 3, 8, 7, 0, 3, 7, 6]);
    b.sorted(Iterate.COMPARE_NUMBER).skip(5).overwrite(0);
    expect( b.array() ).toEqual( [1, 0, 2, 3, 0, 0, 0, 3, 0, 0] );
  });

  it('shuffle', () =>
  {
    const a = [1, 2, 3, 4, 5, 6, 7];
    const b = Iterate.array(a);

    expect( b.shuffle().array() ).not.toEqual(a);
  })

  it('sub', () =>
  {
    const a = Iterate.array([1, 2, 3, 4, 5, 6, 7, 8]);
    const b: number[] = [];

    a.where(x => x > 3)
      .sub(s => s.where(x => x % 3 === 0).delete() )
      .sub(s => s.where(x => x % 3 === 2).delete() )
      .array(b);

    expect( a.array() ).toEqual( [1, 2, 3, 4, 7] );
    expect( b ).toEqual( [4, 7] );
  });

  it('split', () =>
  {
    const a = Iterate.array([1, 2, 3, 4, 5, 6, 7, 8]);
    const b: number[] = [];
    const c: number[] = [];

    a.split(x => x % 2 === 0, (pass, fail) => {
      pass.array(b);
      fail.array(c);
    });

    expect( b ).toEqual( [2, 4, 6, 8] );
    expect( c ).toEqual( [1, 3, 5, 7] );

    const { pass, fail } = a.split(x => x % 2 === 0);

    expect( pass.array() ).toEqual( [2, 4, 6, 8] );
    expect( fail.array() ).toEqual( [1, 3, 5, 7] );
  });

  it('array', () => 
  {
    expect( Iterate.array([]).array() ).toEqual( [] );
    expect( Iterate.array([1, 2]).array() ).toEqual( [1, 2] );
    expect( Iterate.object({x: 1, y: 4}).array() ).toEqual( [1, 4] );
  });

  it('object', () => 
  {
    expect( Iterate.array([]).object(x => x) ).toEqual( {} );
    expect( Iterate.array([1, 2]).object(x => x) ).toEqual( {1: 1, 2: 2} );
  });

  it('set', () => 
  {
    expect( Iterate.array([]).set() ).toEqual( new Set([]) );
    expect( Iterate.array([1, 2]).set() ).toEqual( new Set([1, 2]) );
  });

  it('group', () =>
  {
    const groups = Iterate.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).group(x => x % 3);

    expect( groups ).toEqual({
      0: [0, 3, 6, 9],
      1: [1, 4, 7],
      2: [2, 5, 8]
    });
  });

  it('iterable', () =>
  {
    expect( Iterate.iterable([1, 2, 3]).array() ).toEqual( [1, 2, 3] );
    expect( Iterate.iterable(new Set([1, 2, 3])).array() ).toEqual( [1, 2, 3] );
  });

  it('readonly', () =>
  {
    const a = [1, 2, 3, 4];
    const b = Iterate.array(a);

    const c = b.where(x => x % 2 === 0).delete();

    expect( c.array() ).toEqual( [] );
    expect( a ).toEqual( [1, 3] );

    const aa = [1, 2, 3, 4];
    const bb = Iterate.array(aa).readonly();

    const cc = bb.where(x => x % 2 === 0).delete();

    expect( cc.array() ).toEqual( [2, 4] );
    expect( aa ).toEqual( [1, 2, 3, 4] );
  });

  it('copy', () =>
  {
    const a = [1, 2, 3, 4];
    const b = Iterate.array(a);

    b.copy().delete();

    expect( b.array() ).toEqual( [1, 2, 3, 4] );
    expect( a ).toEqual( [1, 2, 3, 4] );

    expect( b.copy().array() ).toEqual( [1, 2, 3, 4] );

    b.delete();

    expect( b.array() ).toEqual( [] );
    expect( a ).toEqual( [] );
  });

  interface Node<T> {
    value: T;
    next?: Node<T>;
  }

  const linkedIterator = Iterate.linked<Node<string>, string>(
    (node) => node.value,
    (node) => node.next,
    (node, prev) => prev.next = node.next,
    (node, value) => node.value = value
  );

  const getLinkedList = (): Node<string> => {
    return {
      value: 'HEAD',
      next: {
        value: 'a',
        next: {
          value: 'b',
          next: {
            value: 'c',
            next: {
              value: 'd',
              next: {
                value: 'e'
              }
            }
          }
        }
      }
    };
  };

  it('linked', () =>
  {
    const list = getLinkedList();
    const listIterator = linkedIterator(list.next, list);
    
    expect( listIterator.array() ).toEqual( ['a', 'b', 'c', 'd', 'e'] );
    expect( listIterator.where(L => L === 'a' || L === 'd').array() ).toEqual( ['a', 'd'] );

    listIterator.where(L => L === 'a' || L === 'd').delete();

    expect( listIterator.array() ).toEqual( ['b', 'c', 'e'] );

    listIterator.delete();

    expect( listIterator.array() ).toEqual( [] );
  });

  interface TreeNode<T> {
    value: T;
    children?: TreeNode<T>[];   
  }

  const treeIterator = Iterate.tree<TreeNode<string>, string>(
    node => node.value,
    node => node.children,
    (node, value) => node.value = value
  );

  const getTree = (): TreeNode<string> => {
    return {
      value: 'Harry',
      children: [{
        value: 'Michael',
        children: [{
          value: 'Robert'
        }, {
          value: 'Philip',
          children: [{
            value: 'Mackenzie'
          }, {
            value: 'Mason'
          }]
        }, {
          value: 'Joseph',
          children: [{
            value: 'Miles'
          }]
        }, {
          value: 'Katlyn'
        }, {
          value: 'Alyssa'
        }]
      }, {
        value: 'Donald'
      }]
    };
  };

  it('tree depth', () =>
  {
    const tree = getTree();
    const list = treeIterator(tree, true).array();

    expect(list).toEqual(['Harry', 'Michael', 'Robert', 'Philip', 'Mackenzie', 'Mason', 'Joseph', 'Miles', 'Katlyn', 'Alyssa', 'Donald']);
  });

  it('tree breadth', () =>
  {
    const tree = getTree();
    const list = treeIterator(tree, false).array();

    expect(list).toEqual(['Harry', 'Michael', 'Donald', 'Robert', 'Philip', 'Joseph', 'Katlyn', 'Alyssa', 'Mackenzie', 'Mason', 'Miles']);
  });

  it('tree purge', () =>
  {
    const tree = getTree();
    
    treeIterator(tree).where(name => name.indexOf('e') !== -1).delete();

    const list = treeIterator(tree).array();

    expect(list).toEqual(['Harry', 'Donald']);
  });

  it('tree replace', () =>
  {
    const tree = getTree();

    treeIterator(tree).iterate((name, iter) => iter.replace(name.toLowerCase()));

    const list = treeIterator(tree).array();

    expect(list).toEqual(['harry', 'michael', 'robert', 'philip', 'mackenzie', 'mason', 'joseph', 'miles', 'katlyn', 'alyssa', 'donald']);
  });

})
