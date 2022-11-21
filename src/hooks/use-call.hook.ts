import { useRef, useCallback, useReducer } from "react";

import {
  ApiMiddleware,
  ApiRequestErrorResponse,
  ApiRequestDetailsResponse,
  ApiMiddlewareFetchRequestType,
  ApiRequestResponseType,
  ApiRequestResponsePromiseType,
  ApiRequest,
} from "api/rest";
import {
  Nullable,
  ExtractApiResponse,
  ExtractApiError,
  ExtractApiParams,
  ExtractApiRequest,
  ExtractApiHasData,
  ExtractApiHasParams,
  ExtractApiHasQuery,
  FunctionType,
  StateFunction,
} from "models";
import { useDidUnmount } from "hooks/use-did-unmount.hook";
import { isFunction } from "utils/helpers/is-function";
import { createReducerSlice, PayloadAction } from "utils/store/create-reducer-slice";

type SuccessCallback<T> = (payload: T) => void;
type OnSuccessCallback<T> = (callback: SuccessCallback<T>) => void;

type ErrorCallback<E> = (error: ApiRequestErrorResponse<E>) => void;
type OnErrorCallback<E> = (callback: ErrorCallback<E>) => void;

type FinalCallback<T, E> = (result: ApiRequestResponseType<T, E>) => void;
type OnFinalCallback<T, E> = (callback: FinalCallback<T, E>) => void;

type State<T = null, E = any> = {
  data: T;
  error: ApiRequestErrorResponse<E> | null;
  details: ApiRequestDetailsResponse;
  submitting: boolean;
};

type Actions<T, E> = {
  setData: (data: StateFunction<Nullable<T>>) => void;
  setError: (error: ApiRequestErrorResponse<E> | null) => void;
  setDetails: (details: ApiRequestDetailsResponse) => void;
  setSubmitting: (submitting: boolean) => void;
};

const initialState: State = {
  data: null,
  error: null,
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
  submitting: false,
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
    setSubmitting: (state, { payload }: PayloadAction<boolean>) => {
      state.submitting = payload;
    },
  },
});

export type UseCallReturnType<A extends ApiMiddleware<any, any, any, any, any, any, any, any>> = {
  submit: FunctionType<
    Parameters<
      ApiMiddlewareFetchRequestType<
        ExtractApiParams<A>,
        ExtractApiRequest<A>,
        ExtractApiResponse<A>,
        ExtractApiError<A>,
        ExtractApiHasData<A>,
        ExtractApiHasParams<A>,
        ExtractApiHasQuery<A>
      >
    >,
    ApiRequestResponsePromiseType<ExtractApiResponse<A>, ExtractApiError<A>>
  >;
  payload: Nullable<ExtractApiResponse<A>>;
  error: ApiRequestErrorResponse<ExtractApiError<A>> | null;
  actions: Actions<ExtractApiResponse<A>, ExtractApiError<A>>;
  details: ApiRequestDetailsResponse;
  submitting: boolean;
  abortCall: VoidFunction;
  onCallSuccess: OnSuccessCallback<ExtractApiResponse<A>>;
  onCallError: OnErrorCallback<ExtractApiError<A>>;
  onCallFinal: OnFinalCallback<ExtractApiResponse<A>, ExtractApiError<A>>;
};

export const useCall = <A extends ApiMiddleware<any, any, any, any, any, any, any>>(
  asyncApiCall: A,
): UseCallReturnType<A> => {
  const componentIsMounted = useRef(true);
  useDidUnmount(() => (componentIsMounted.current = false));

  const pendingRequestRef = useRef<ApiRequest<any, any, any> | null>(null);

  const apiCallRef = useRef(asyncApiCall);
  apiCallRef.current = asyncApiCall;

  const [state, dispatch] = useReducer(reducer, initialState);

  const dispatchedActions: Actions<ExtractApiResponse<A>, ExtractApiError<A>> = {
    setData: (payload) => {
      dispatch(actions.setData(isFunction(payload) ? payload(state.data) : payload));
    },
    setError: (error) => dispatch(actions.setError(error)),
    setSubmitting: (submitting) => dispatch(actions.setSubmitting(submitting)),
    setDetails: (details) => dispatch(actions.setDetails(details)),
  };
  const { setSubmitting, setData, setError, setDetails } = dispatchedActions;

  const onSuccessCallback = useRef<Nullable<SuccessCallback<ExtractApiResponse<A>>>>(null);
  const onErrorCallback = useRef<Nullable<ErrorCallback<ExtractApiError<A>>>>(null);
  const onFinalCallback =
    useRef<Nullable<FinalCallback<ExtractApiResponse<A>, ExtractApiError<A>>>>(null);

  const handleAbort = useCallback(() => {
    if (state.submitting && pendingRequestRef.current) pendingRequestRef.current.abort();
  }, []);

  const handleSend: any = useCallback(async (data: any) => {
    setSubmitting(true);
    setError(null);

    const request = apiCallRef.current.getRequest(data);
    pendingRequestRef.current = request;

    const fetchedData = await request.fetch();
    const { success, error, details } = fetchedData;
    const { isCanceled, isTimeout, isSuccess } = details;

    if (isCanceled || !componentIsMounted.current) return fetchedData;

    if (isTimeout) {
      setData(null);
      setDetails(details);
      setError(error);
      setSubmitting(false);
      return fetchedData;
    }

    const hasError = error && !isSuccess;
    const dataToSet = hasError ? null : success;
    const errorToSet = hasError ? error : null;

    setData(dataToSet);
    setError(errorToSet);
    setDetails(details);
    setSubmitting(false);

    const callback = hasError ? onErrorCallback.current : onSuccessCallback.current;
    callback?.(errorToSet ?? dataToSet);
    onFinalCallback.current?.(fetchedData);
    return fetchedData;
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
    submit: handleSend,
    payload: state.data as ExtractApiResponse<A>,
    error: state.error,
    actions: dispatchedActions,
    details: state.details,
    submitting: state.submitting,
    abortCall: handleAbort,
    onCallSuccess: handleSuccess,
    onCallError: handleError,
    onCallFinal: handleFinal,
  };
};

export default useCall;
