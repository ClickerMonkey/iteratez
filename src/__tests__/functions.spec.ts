// import { describe, it, expect } from 'jest';
// tslint:disable-next-line: match-default-export-name
import iz, { Iterate } from '../';


// tslint:disable: no-magic-numbers

describe('iz', () => {

  it('array', () =>
  {
    const source = [1, 2, 3];
    // Iterate<number, number, number[]>
    const a = iz(source);

    expect( a.array() ).toEqual( [1, 2, 3] );
    expect( a.keys().array() ).toEqual( [0, 1, 2] );

    a.where(x => x % 2 === 0).delete();

    expect( source ).toEqual( [1, 3] );
  });

  it('object', () =>
  {
    const source = {
      a: 'Apple',
      b: 'Banana',
      c: 'Cat',
      d: 'Dog'
    };
    // Iterate<string, string, {string: string}>
    const a = iz(source);

    expect( a.array() ).toEqual( ['Apple', 'Banana', 'Cat', 'Dog'] );
    expect( a.keys().array() ).toEqual( ['a', 'b', 'c', 'd'] );

    a.where((x, k) => k === 'c').delete();

    expect( source ).toEqual({
      a: 'Apple',
      b: 'Banana',
      d: 'Dog'
    });
  });

  it('set', () =>
  {
    const source = new Set([1, 2, 3]);
    // Iterate<number, number, Set<number>>
    const a = iz(source);

    expect( a.array() ).toEqual( [1, 2, 3] );
    expect( a.keys().array() ).toEqual( [1, 2, 3] );

    a.where(x => x % 2 === 0).delete();

    expect( [...source.values()] ).toEqual( [1, 3] );
  });

  it('map', () =>
  {
    const source = new Map([
      ['a', 'Apple'],
      ['b', 'Banana'],
      ['c', 'Cat'],
      ['d', 'Dog']
    ]);
    // Iterate<string, string, Map<string, string>>
    const a = iz(source);

    expect( a.array() ).toEqual( ['Apple', 'Banana', 'Cat', 'Dog'] );
    expect( a.keys().array() ).toEqual( ['a', 'b', 'c', 'd'] );

    a.where((x, k) => k === 'c').delete();

    expect( [...source.entries()] ).toEqual([
      ['a', 'Apple'],
      ['b', 'Banana'],
      ['d', 'Dog']
    ]);
  });

  it('value', () =>
  {
    const source = 4;
    // Iterate<number, number, [number]>
    const a = iz(source);

    expect( a.array() ).toEqual( [4] );
    expect( a.keys().array() ).toEqual( [0] );

    a.delete();

    expect( a.array() ).toEqual( [] );
  });

  it('null', () =>
  {
    const source: any = null;
    // Iterate<{}, number, any>
    const a = iz(source);

    expect( a.array() ).toEqual( [] );
    expect( a.keys().array() ).toEqual( [] );

    a.delete();

    expect( a.array() ).toEqual( [] );
  });

  it('undefined', () =>
  {
    // Iterate<any, any, any>
    const a = iz();

    expect( a.array() ).toEqual( [] );
    expect( a.keys().array() ).toEqual( [] );

    a.delete();

    expect( a.array() ).toEqual( [] );
  });

  it('string', () =>
  {
    // Iterate<string, number, string>
    const a = iz('hello');

    expect( a.array() ).toEqual( ['h', 'e', 'l', 'l', 'o'] );
  });

  it('joins type', () =>
  {
    const a = 45;
    const b = [1, 2, 3];
    const c = {a: 1, b: 2};
    // Iterate<number, any, any>
    const joined = Iterate.join(a, b, c);

    expect( joined.array() ).toEqual( [45, 1, 2, 3, 1, 2] );
  });

  it('joins type key', () =>
  {
    const a = 45;
    const b = [1, 2, 3];
    // Iterate<number, number, any>
    const joined = Iterate.join(a, b);

    expect( joined.array() ).toEqual( [45, 1, 2, 3] );
  });

  it('joins type key source', () =>
  {
    const a = [45];
    const b = [1, 2, 3];
    // Iterate<number, number, number[]>
    const joined = Iterate.join(a, b);

    expect( joined.array() ).toEqual( [45, 1, 2, 3] );
  });

  it('joins iterators', () =>
  {
    const a = iz([45]);
    const b = iz([1, 2, 3]);
    // Iterate<number, number, number[]>
    const joined = Iterate.join(a, b);

    expect( joined.array() ).toEqual( [45, 1, 2, 3] );
  });

  it('joins any', () =>
  {
    const a = {x: 'hello'};
    const b = [1, 2];
    // Iterate<any, any, any>
    const joined = Iterate.join(a, b);

    expect( joined.array() ).toEqual( ['hello', 1, 2] );
  });

});