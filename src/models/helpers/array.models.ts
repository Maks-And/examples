import { UnionToObject } from "models";

export type ArrayElement<A> = A extends any[] ? A[number] : A;

export type FirstElement<T extends any[]> = T extends [infer U, ...any[]] ? U : never;

export type MaybeArray<T> = T | Array<T>;

export type ExtendsArray<T> = T extends any[] ? true : false;

export interface FixedLengthArray<T, L extends number> extends Array<T> {
  0: T;
  length: L;
}

export type isEmptyArray<T extends any[]> = T extends [] ? true : false;

export type LastElement<T extends any[]> = {
  0: LastElement<Tail<T>>;
  1: FirstElement<T>;
}[HasTail<T> extends true ? 0 : 1];

export type HasTail<T extends any[]> = T extends [] | [any] ? false : true;

/**
 * Returns "tail" part of tuple type, simply by cutting 1st element
 * @example
 * type T = Tail<[1, 2, 3, 4]>
 * // returns: [2, 3, 4] tuple type
 * @example
 * type T = Tail<["potato", "tomato", "tornado"]>
 * // returns: ["tomato", "tornado"] tuple type
 */
export type Tail<T extends any[]> = ((...args: T) => any) extends (_: any, ...tail: infer R) => any
  ? R
  : never;

/**
 * Returns passed tuple with added type to the first element
 * @example
 * type T = Prepend<1, [2, 3, 4]>
 * // returns: [1, 2, 3, 4] tuple type
 * @example
 * type T = Prepend<"potato", ["tomato", "tornado"]>
 * // returns: ["potato", "tomato", "tornado"] tuple type
 */
export type Prepend<E, T extends any[]> = ((first: E, ...args: T) => any) extends (
  ...args: infer U
) => any
  ? U
  : T;

/**
 * Returns passed tuple with added type to the last element
 * @example
 * type T = Append<1, [2, 3, 4]>
 * // returns: [2, 3, 4, 1] tuple type
 * @example
 * type T = Append<"potato", ["tomato", "tornado"]>
 * // returns: ["tomato", "tornado", "potato"] tuple type
 */
export type Append<E, T extends any[]> = Concat<T, [E]>;

/**
 * Returns new tuple with cutting by amount passed
 * @example
 * type T = Drop<2, [1, 2, 3, 4]>;
 * // returns: [3, 4] tuple type
 * @example
 * type T = Drop<2, ["tomato", "tornado", "potato"]>;
 * // returns: ["potato"] tuple type
 */
export type Drop<Amount extends number, T extends any[], I extends any[] = []> = {
  0: Drop<Amount, Tail<T>, Prepend<any, I>>;
  1: T;
}[Length<I> extends Amount ? 1 : 0];

export type Length<T extends any[]> = T["length"];

export type Pos<I extends any[]> = Length<I>; // alias

export type Next<I extends any[]> = Prepend<any, I>;

export type Prev<I extends any[]> = Tail<I>; // alias

/**
 * Creates new tuple type based on "Index" and "From" generics
 * @example
 * type T1 = Iterator<4>;
 * // returns: [any, any, any, any] tuple type
 * @example
 * type T1 = Iterator<4, [any, any]>;
 * // returns: [any, any, any, any, any, any] tuple type
 */
export type Iterator<Index extends number = 0, From extends any[] = [], I extends any[] = []> = {
  0: Iterator<Index, Next<From>, Next<I>>;
  1: From;
}[Pos<I> extends Index ? 1 : 0];

/**
 * Returns reversed "T" generic tuple with connecting "R" generic tuple
 * @example
 * type T = Reverse<[1, 2, 3], [4, 5, 6]>;
 * // returns: [3, 2, 1, 4, 5, 6] tuple type
 * @example
 * type T = Reverse<["potato", "tomato", "tornado"], ["Lumbago", "Chicago", "Legato"]>;
 * // returns: ["tornado", "tomato", "potato", "Lumbago", "Chicago", "Legato"] tuple type
 */
export type Reverse<T extends any[], R extends any[] = [], I extends any[] = Iterator> = {
  0: Reverse<T, Prepend<T[Pos<I>], R>, Next<I>>;
  1: R;
}[Pos<I> extends Length<T> ? 1 : 0];

/**
 * Returns joined tuples
 * @example
 * type T = Concat<[1, 2, 3], [4, 5, 6]>;
 * // returns: [1, 2, 3, 4, 5, 6] tuple type
 * @example
 * type T = Concat<["potato", "tomato", "tornado"], ["Lumbago", "Chicago", "Legato"]>;
 * // returns: ["potato", "tomato", "tornado", "Lumbago", "Chicago", "Legato"] tuple type
 */
export type Concat<A1 extends any[], A2 extends any[]> = {
  0: Concat<Push<A1, A2[0]>, Tail<A2>>;
  1: A1;
}[isEmptyArray<A2> extends true ? 1 : 0];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R
  ? R
  : never;

export type Push<T extends any[], V> = [...T, V];

export type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : Push<TuplifyUnion<Exclude<T, L>>, L>;

export type isUnionType<T extends string> = 1 extends TuplifyUnion<keyof UnionToObject<T>>["length"]
  ? false
  : true;

export type MergeArrays<T extends Array<any[]>, R extends any[] = []> = {
  // 0: MergeArrays<Tail<T>, Concat<R, T[0]>>;
  0: MergeArrays<Tail<T>, Push<R, ArrayElement<T[0]>>>;
  1: ArrayElement<R>[];
}[isEmptyArray<T> extends true ? 1 : 0];
