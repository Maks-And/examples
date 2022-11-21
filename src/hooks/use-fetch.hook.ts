import { useCallback, useReducer, useRef, DependencyList } from "react";

import {
  ApiMiddleware,
  ApiRequestErrorResponse,
  ApiRequestDetailsResponse,
  ApiRequest,
  ApiRequestResponseType,
} from "api/rest";
import { useDidUnmount } from "hooks/use-did-unmount.hook";
import { useDidUpdate } from "hooks/use-did-update.hook";
import {
  Nullable,
  NullableType,
  ExtractApiResponse,
  ExtractApiError,
  ExtractApiParams,
  ExtractEndpointParams,
  StateFunction,
} from "models";
import { isFunction } from "utils/helpers/is-function";
import { createReducerSlice, PayloadAction } from "utils/store/create-reducer-slice";

type StartCallback = VoidFunction;
type OnStartCallback = (callback: StartCallback) => void;

type SuccessCallback<T> = (payload: T) => void;
type OnSuccessCallback<T> = (callback: SuccessCallback<T>) => void;

type ErrorCallback<E> = (error: ApiRequestErrorResponse<E>) => void;
type OnErrorCallback<E> = (callback: ErrorCallback<E>) => void;

type FinalCallback<T, E> = (result: ApiRequestResponseType<T, E>) => void;
type OnFinalCallback<T, E> = (callback: FinalCallback<T, E>) => void;

type State<T = null, E = any> = {
  data: Nullable<T>;
  error: ApiRequestErrorResponse<E> | null;
  details: ApiRequestDetailsResponse;
  loading: boolean;
  firstLoading: boolean;
};

type Actions<T, E> = {
  setData: (data: StateFunction<Nullable<T>>) => void;
  setError: (error: ApiRequestErrorResponse<E> | null) => void;
  setDetails: (details: ApiRequestDetailsResponse) => void;
  setLoading: (loading: boolean) => void;
  setFirstLoading: (loading: boolean) => void;
};

const initialState: State = {
  data: null,
  error: null,
  loading: true,
  firstLoading: true,
  details: {
    status: "none",
    statusCode: 0,
    isCanceled: false,
    isTimeout: false,
    isSuccess: false,
    time: {
      startTime: 0,
      finishTime: 0,
      delta: 0,
    },
  },
};

const { reducer, actions } = createReducerSlice({
  initialState,
  actions: {
    setData: (state, { payload }: PayloadAction<any>) => {
      state.data = payload;
    },
    setError: (state, { payload }: PayloadAction<ApiRequestErrorResponse | null>) => {
      state.error = payload;
    },
    setDetails: (state, { payload }: PayloadAction<ApiRequestDetailsResponse>) => {
      state.details = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setFirstLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.firstLoading = payload;
    },
  },
});

export type UseFetchOptionsType = {
  dependencies?: DependencyList;
  disabled?: boolean;
};

export type UseFetchReturnType<A extends ApiMiddleware<any, any, any, any, any, any, any>> = {
  payload: Nullable<ExtractApiResponse<A>>;
  loading: boolean;
  firstLoading: boolean;
  error: ApiRequestErrorResponse<ExtractApiError<A>> | null;
  details: ApiRequestDetailsResponse;
  actions: Actions<ExtractApiResponse<A>, ExtractApiError<A>>;
  refresh: () => Promise<void>;
  abortFetch: VoidFunction;
  onFetchStart: OnStartCallback;
  onFetchSuccess: OnSuccessCallback<ExtractApiResponse<A>>;
  onFetchError: OnErrorCallback<ExtractApiError<A>>;
  onFetchFinal: OnFinalCallback<ExtractApiResponse<A>, ExtractApiError<A>>;
};

export const useFetch = <A extends ApiMiddleware<any, any, undefined, any, any, any, any, any>>(
  asyncApiCall: ExtractEndpointParams<ExtractApiParams<A>> extends NullableType
    ? A
    : A extends ApiMiddleware<any, any, undefined, any, any, true, any, any>
    ? A
    : never,
  options: UseFetchOptionsType = {},
): UseFetchReturnType<A> => {
  const { dependencies = [], disabled } = options;

  const pendingRequestRef = useRef<ApiRequest<any, any, any> | null>(null);

  const componentIsMounted = useRef(true);
  useDidUnmount(() => (componentIsMounted.current = false));

  const apiCallRef = useRef(asyncApiCall);
  apiCallRef.current = asyncApiCall;

  const [state, dispatch] = useReducer(reducer, initialState as State<ExtractApiResponse<A>>);

  const dispatchedActions: Actions<ExtractApiResponse<A>, ExtractApiError<A>> = {
    setData: (payload) => {
      dispatch(actions.setData(isFunction(payload) ? payload(state.data) : payload));
    },
    setError: (error) => dispatch(actions.setError(error)),
    setDetails: (details) => dispatch(actions.setDetails(details)),
    setLoading: (loading) => dispatch(actions.setLoading(loading)),
    setFirstLoading: (loading) => dispatch(actions.setFirstLoading(loading)),
  };

  const { setData, setError, setDetails, setLoading, setFirstLoading } = dispatchedActions;

  const onStartCallback = useRef<Nullable<StartCallback>>(null);
  const onSuccessCallback = useRef<Nullable<SuccessCallback<ExtractApiResponse<A>>>>(null);
  const onErrorCallback = useRef<Nullable<ErrorCallback<ExtractApiError<A>>>>(null);
  const onFinalCallback =
    useRef<Nullable<FinalCallback<ExtractApiResponse<A>, ExtractApiError<A>>>>(null);

  const handleAbort = useCallback(() => {
    if (state.loading && pendingRequestRef.current) pendingRequestRef.current.abort();
  }, []);

  const handleFetch = useCallback(async () => {
    handleAbort();

    onStartCallback.current?.();

    setLoading(true);
    setError(null);

    const request = apiCallRef.current.getRequest();
    pendingRequestRef.current = request;

    const fetchedData = await request.fetch();
    const { success, error, details } = fetchedData;

    const { isCanceled, isTimeout, isSuccess } = details;

    if (isCanceled || !componentIsMounted.current) return;

    setFirstLoading(false);

    if (isTimeout) {
      setData(null);
      setDetails(details);
      setError(error);
      setLoading(false);
      return;
    }

    const hasError = error && !isSuccess;

    const dataToSet = hasError ? null : success;
    const errorToSet = hasError ? error : null;

    setData(dataToSet);
    setError(errorToSet);
    setDetails(details);
    setLoading(false);

    const callback = hasError ? onErrorCallback.current : onSuccessCallback.current;
    callback?.(errorToSet ?? dataToSet);
    onFinalCallback.current?.(fetchedData);
  }, [state.loading]);

  useDidUpdate(
    () => {
      if (disabled) return setLoading(false);
      handleFetch();
    },
    dependencies,
    true,
  );

  useDidUnmount(handleAbort);

  const handleStart: OnStartCallback = useCallback((callback) => {
    onStartCallback.current = callback;
  }, []);

  const handleSuccess: OnSuccessCallback<ExtractApiResponse<A>> = useCallback((callback) => {
    onSuccessCallback.current = callback;
  }, []);

  const handleError: OnErrorCallback<ExtractApiError<A>> = useCallback((callback) => {
    onErrorCallback.current = callback;
  }, []);

  const handleFinal: OnFinalCallback<ExtractApiResponse<A>, ExtractApiError<A>> = useCallback(
    (callback) => {
      onFinalCallback.current = callback;
    },
    [],
  );

  return {
    payload: state.data as ExtractApiResponse<A>,
    error: state.error,
    loading: state.loading,
    firstLoading: state.firstLoading,
    details: state.details,
    actions: dispatchedActions,
    refresh: handleFetch,
    abortFetch: handleAbort,
    onFetchStart: handleStart,
    onFetchSuccess: handleSuccess,
    onFetchError: handleError,
    onFetchFinal: handleFinal,
  };
};

export default useFetch;
