export type Negatives = null | undefined;

export type Primitives = number | string | boolean | bigint | undefined | symbol;

export type Nullable<T> = T | Negatives;

export type NullableType = Nullable<never>;

export type ExtendsUndefined<T> = 1 extends (T extends undefined ? 1 : 0) ? true : false;

export type ExtendsNever<T> = never extends T ? (T extends never ? true : false) : false;

export type NonUndefined<T> = T extends undefined ? never : T;

export type Cast<X, Y> = X extends Y ? X : Y;

export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export type DeepMutable<T> = { -readonly [K in keyof T]: DeepMutable<T[K]> };

export type MaybeMutable<T> = Mutable<T> | Readonly<T>;

export type Constructor<T> = {
  new (...args: any[]): T;
  prototype: T;
};

export type Constructors<T extends any[]> = {
  [Key in keyof T]: Constructor<T[Key]>;
};

export type EndpointParamType = string | number;

export type Ternary<L, R, T extends true | false> = true extends T ? L : R;

export type ExtractEndpointParams<T extends string> = string extends T
  ? null
  : T extends `${string}:${infer Param}/${infer Rest}`
  ? { [k in Param | keyof ExtractEndpointParams<Rest>]: EndpointParamType }
  : T extends `${string}:${infer Param}`
  ? { [k in Param]: EndpointParamType }
  : null;

export type KeyBoardKeys =
  | "KeyQ"
  | "KeyW"
  | "KeyE"
  | "KeyR"
  | "KeyT"
  | "KeyY"
  | "KeyU"
  | "KeyI"
  | "KeyO"
  | "KeyP"
  | "BracketLeft"
  | "BracketRight"
  | "KeyA"
  | "KeyS"
  | "KeyD"
  | "KeyF"
  | "KeyG"
  | "KeyH"
  | "KeyJ"
  | "KeyK"
  | "KeyL"
  | "Semicolon"
  | "Quote"
  | "KeyZ"
  | "KeyX"
  | "KeyC"
  | "KeyV"
  | "KeyB"
  | "KeyN"
  | "KeyM"
  | "Comma"
  | "Period"
  | "Slash"
  | "Backslash"
  | "Enter"
  | "NumpadEnter"
  | "ShiftLeft"
  | "ShiftRight"
  | "ControlLeft"
  | "ControlRight"
  | "MetaLeft"
  | "MetaRight"
  | "AltLeft"
  | "AltRight"
  | "Space"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "ArrowDown"
  | "Escape"
  | "Backquote"
  | "Tab"
  | "CapsLock"
  | "Digit1"
  | "Digit2"
  | "Digit3"
  | "Digit4"
  | "Digit5"
  | "Digit6"
  | "Digit7"
  | "Digit8"
  | "Digit9"
  | "Digit0"
  | "Minus"
  | "Equal"
  | "Backspace"
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "F10"
  | "F11"
  | "F12";
