import { Nullable, isEmptyArray, Tail } from "models";

export type ObjectType<T = any, P extends PropertyKey = PropertyKey> = Record<P, T>;

export type Dictionary<T> = ObjectType<T, string>;

export type NumericDictionary<T> = ObjectType<T, number>;

export type EmptyObjectType = ObjectType<never>;

export type ObjectKeys<T extends ObjectType> = keyof T;

export type ObjectValues<T extends ObjectType> = T[ObjectKeys<T>];

export type SwappedObject<T extends Dictionary<string>> = { [K in keyof T as T[K]]: K };

export type QueryParam = any;

export type QueryParams = ObjectType<QueryParam>;

export type OmitObject<T extends ObjectType, K extends keyof T> = {
  [P in keyof Omit<T, K>]: T[P];
};

export type PickKeysByType<T extends ObjectType, N> = {
  [K in keyof T as T[K] extends N ? K : never]: T[K];
};

export type OmitKeysByType<T extends ObjectType, N> = {
  [K in keyof T as T[K] extends N ? never : K]: OmitKeysByType<T[K], N>;
};

export type PartialBy<T extends ObjectType, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type PartialExcept<T extends ObjectType, K extends keyof T> = Partial<Omit<T, K>> &
  Pick<T, K>;

export type PartialNullable<T> = {
  [P in keyof T]?: Nullable<T[P]>;
};

export type PartialNullableBy<T extends ObjectType, K extends keyof T> = Omit<T, K> &
  PartialNullable<Pick<T, K>>;

export type PartialKeys<T extends ObjectType> = {
  [K in keyof T]?: Partial<T[K]>;
};

export type NonNullableKeys<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

export type NonNullableKeysBy<T, K extends keyof T> = Omit<T, K> & NonNullableKeys<Pick<T, K>>;

export type NonNullableKeysExcept<T, K extends keyof T> = NonNullableKeys<Omit<T, K>> & Pick<T, K>;

export type UnionToObject<T extends string> = ObjectType<never, T>;

export type PickUnion<T extends string, K extends keyof UnionToObject<T>> = keyof Pick<
  UnionToObject<T>,
  K
>;

export type OmitUnion<T extends string, K extends keyof UnionToObject<T>> = keyof Omit<
  UnionToObject<T>,
  K
>;

export type ObjectKeysArr<T> = T extends ObjectType
  ? (keyof T)[]
  : T extends number
  ? []
  : T extends Array<any> | string
  ? string[]
  : never;

export type MergeObjects<T extends ObjectType[], R extends ObjectType = EmptyObjectType> = {
  0: MergeObjects<Tail<T>, T[0] & R>;
  1: R;
}[isEmptyArray<T> extends true ? 1 : 0];
