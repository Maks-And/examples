import { DependencyList, useCallback, useReducer, useRef } from "react";

import { Nullable, StateFunction } from "models";
import { useDidUnmount } from "hooks/use-did-unmount.hook";
import { useDidUpdate } from "hooks/use-did-update.hook";
import { isFunction } from "utils/helpers/is-function";
import { createReducerSlice, PayloadAction } from "utils/store/create-reducer-slice";

type StartCallback = VoidFunction;
type OnStartCallback = (callback: StartCallback) => void;

type SuccessCallback<T> = (payload: T) => void;
type OnSuccessCallback<T> = (callback: SuccessCallback<T>) => void;

type ErrorCallback = (error: any) => void;
type OnErrorCallback = (callback: ErrorCallback) => void;

type FinalCallback = (result: any) => void;
type OnFinalCallback = (callback: FinalCallback) => void;

type State<T = null, E = any> = {
  data: Nullable<T>;
  error: any;
  pending: boolean;
  firstPending: boolean;
};

type Actions<T> = {
  setData: (data: StateFunction<Nullable<T>>) => void;
  setError: (error: any) => void;
  setLoading: (loading: boolean) => void;
  setFirstLoading: (loading: boolean) => void;
};

const initialState: State = {
  data: null,
  error: null,
  pending: true,
  firstPending: true,
};

const { reducer, actions } = createReducerSlice({
  initialState,
  actions: {
    setData: (state, { payload }: PayloadAction<any>) => {
      state.data = payload;
    },
    setError: (state, { payload }: PayloadAction<any>) => {
      state.error = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.pending = payload;
    },
    setFirstLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.firstPending = payload;
    },
  },
});

export type UsePromiseOptionsType = {
  dependencies?: DependencyList;
  disabled?: boolean;
  disableMountCall?: boolean;
};

export type UsePromiseOutput<T> = {
  payload: Nullable<T>;
  error: any;
  pending: boolean;
  firstPending: boolean;
  actions: Actions<T>;
  rePromise: () => Promise<T>;
  onPromiseStart: OnStartCallback;
  onPromiseSuccess: OnSuccessCallback<T>;
  onPromiseError: OnErrorCallback;
  onPromiseFinal: OnFinalCallback;
};

export const usePromise = <T>(
  callback: () => Promise<T>,
  options: UsePromiseOptionsType = {},
): UsePromiseOutput<T> => {
  const { dependencies = [], disabled = false, disableMountCall = false } = options;

  const componentIsMounted = useRef(true);
  useDidUnmount(() => (componentIsMounted.current = false));

  const promiseCallRef = useRef(callback);
  promiseCallRef.current = callback;

  const [state, dispatch] = useReducer(reducer, initialState);

  const dispatchedActions: Actions<T> = {
    setData: (payload) => {
      dispatch(actions.setData(isFunction(payload) ? payload(state.data) : payload));
    },
    setError: (error) => dispatch(actions.setError(error)),
    setLoading: (loading) => dispatch(actions.setLoading(loading)),
    setFirstLoading: (loading) => dispatch(actions.setFirstLoading(loading)),
  };

  const { setData, setError, setLoading, setFirstLoading } = dispatchedActions;

  const onStartCallback = useRef<Nullable<StartCallback>>(null);
  const onSuccessCallback = useRef<Nullable<SuccessCallback<T>>>(null);
  const onErrorCallback = useRef<Nullable<ErrorCallback>>(null);
  const onFinalCallback = useRef<Nullable<FinalCallback>>(null);

  const handlePromise = useCallback((): Promise<T> => {
    return new Promise<T>(async (resolve, reject) => {
      if (state.pending && !state.firstPending) return;

      onStartCallback.current?.();

      setLoading(true);
      setError(null);

      try {
        const result = await promiseCallRef.current();

        if (!componentIsMounted.current) return;

        setData(result);
        setError(null);
        setFirstLoading(false);
        setLoading(false);
        onSuccessCallback.current?.(result);
        onFinalCallback.current?.(result);

        resolve(result);
      } catch (error) {
        if (!componentIsMounted.current) return;

        setData(null);
        setError(error);
        setFirstLoading(false);
        setLoading(false);
        onErrorCallback.current?.(error);
        onFinalCallback.current?.(error);

        reject(error);
      }
    });
  }, [state.pending, state.firstPending]);

  useDidUpdate(
    () => {
      if (disabled) return setLoading(false);
      handlePromise();
    },
    dependencies,
    !disableMountCall,
  );

  const handleStart: OnStartCallback = useCallback((callback) => {
    onStartCallback.current = callback;
  }, []);

  const handleSuccess: OnSuccessCallback<T> = useCallback((callback) => {
    onSuccessCallback.current = callback;
  }, []);

  const handleError: OnErrorCallback = useCallback((callback) => {
    onErrorCallback.current = callback;
  }, []);

  const handleFinal: OnFinalCallback = useCallback((callback) => {
    onFinalCallback.current = callback;
  }, []);

  return {
    payload: state.data as any,
    error: state.error,
    pending: state.pending,
    firstPending: state.firstPending,
    actions: dispatchedActions,
    rePromise: handlePromise,
    onPromiseStart: handleStart,
    onPromiseSuccess: handleSuccess,
    onPromiseError: handleError,
    onPromiseFinal: handleFinal,
  };
};
