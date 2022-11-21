import { LastElement } from "models";

export type FunctionType<P extends any[] = any[], R = any> = (...arg: P) => R;

export type LastParameter<F extends (...args: any) => any> = LastElement<Parameters<F>>;

export type OmitFirstArg<F> = F extends (arg: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : F;

export type StateInitAction<S> = S | (() => S);

export type StateFunction<S, P = S> = S | ((prevState: P) => S);

export type Dispatch<A> = (value: A) => void;
