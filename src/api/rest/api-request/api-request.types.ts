import {
  Nullable,
  ObjectType,
  PickUnion,
  OmitUnion,
  FunctionType,
  StateFunction,
  OmitObject,
  EmptyObjectType,
} from "models";
import { ApiRequest } from "./api-request";

type MethodType = "post" | "patch" | "put" | "delete" | "get";

export type ApiRequestStatusType = "success" | "error" | "cancelled" | "timeout" | "none";

export type ApiRequestSuccessStatusType = PickUnion<ApiRequestStatusType, "success">;

export type ApiRequestErrorStatusType = OmitUnion<ApiRequestStatusType, "success">;

export type ApiRequestMethodType = MethodType | Uppercase<MethodType>;

export type ApiRequestProgressInfo = {
  progress: number;
  etaTime: number;
  etaSize: number;
  loadedSize: number;
  totalSize: number;
  etaSpeed: number;
};

export type ApiRequestHeaders = ObjectType<string, string>;

export type ApiRequestToken = Nullable<string | number>;

export type ApiRequestTokenCallback = () => ApiRequestToken;

export type ApiRequestSendData = Nullable<Document | XMLHttpRequestBodyInit>;

export type ApiRequestErrorMapperCallback<E> = (error: E) => string;

export type ApiRequestRequestInterceptorCallback<
  AuxiliaryKeys extends ObjectType = EmptyObjectType,
> = (auxiliaryKeys: Partial<AuxiliaryKeys>, headers: ApiRequestHeaders) => ApiRequestHeaders;

export type ApiRequestResponseInterceptorCallback = (
  response: ApiRequestResponseType<any, any>,
  instance: ApiRequest<any, any>,
) => ApiRequestResponseType<any, any> | ApiRequestResponsePromiseType<any, any>;

export type ApiRequestConfigType<
  ErrorData = any,
  AuxiliaryKeys extends ObjectType = EmptyObjectType,
> = {
  href: string | URL;
  method: ApiRequestMethodType;
  tokenPrefix?: string;
  responseType?: XMLHttpRequestResponseType | "json-text";
  timeout?: number;
  cors?: boolean;
  isFormData?: boolean;
  abortOnFetch?: boolean;
  disableInterception?: boolean;
  payload?: any;
  headers?: StateFunction<ApiRequestHeaders>;
  auxiliaryKeys?: Partial<AuxiliaryKeys>;
  tokenCallback?: ApiRequestTokenCallback;
  errorMapper?: ApiRequestErrorMapperCallback<ErrorData>;
  requestInterceptors?: ApiRequestRequestInterceptorCallback<AuxiliaryKeys>[];
  responseInterceptors?: ApiRequestResponseInterceptorCallback[];
};

export type ApiRequestMiddlewareConfigType<
  ErrorData,
  AuxiliaryKeys extends ObjectType = EmptyObjectType,
> = OmitObject<ApiRequestConfigType<ErrorData, AuxiliaryKeys>, "href" | "method" | "payload">;

export type ApiRequestEmitter<ResponseData = undefined, ErrorData = undefined> = {
  requestStart: FunctionType<Parameters<ApiRequestOnDefaultCallback>>;
  requestProgress: FunctionType<Parameters<ApiRequestOnProgressCallback>>;
  responseStart: FunctionType<Parameters<ApiRequestOnDefaultCallback>>;
  responseStatusChange: FunctionType<Parameters<ApiRequestOnStateChangeCallback>>;
  responseProgress: FunctionType<Parameters<ApiRequestOnProgressCallback>>;
  success: FunctionType<Parameters<ApiRequestSuccessCallback<ResponseData>>>;
  error: FunctionType<Parameters<ApiRequestErrorCallback<ErrorData>>>;
  final: FunctionType<Parameters<ApiRequestFinalCallback<ResponseData, ErrorData>>>;
};

export type ApiRequestSuccessResponse<ResponseData = undefined> = ResponseData;

export type ApiRequestDetailsResponse = {
  status: ApiRequestStatusType;
  statusCode: number;
  isCanceled: boolean;
  isTimeout: boolean;
  isSuccess: boolean;
  time: {
    startTime: number;
    finishTime: number;
    delta: number;
  };
};

export type ApiRequestErrorResponse<ErrorData = any> = {
  originalError: ErrorData;
  formattedMessage: string;
  status: ApiRequestErrorStatusType;
  statusCode: number;
};

export type ApiRequestSuccessResponseType<ResponseData> = {
  success: ApiRequestSuccessResponse<ResponseData>;
  error: null;
  status: ApiRequestSuccessStatusType;
  details: ApiRequestDetailsResponse;
  event: ProgressEvent<XMLHttpRequest>;
};

export type ApiRequestErrorResponseType<ErrorData> = {
  success: null;
  error: ApiRequestErrorResponse<ErrorData>;
  status: ApiRequestErrorStatusType;
  details: ApiRequestDetailsResponse;
  event: ProgressEvent<XMLHttpRequest>;
};

export type ApiRequestResponseType<ResponseData, ErrorData> =
  | ApiRequestSuccessResponseType<ResponseData>
  | ApiRequestErrorResponseType<ErrorData>;

export type ApiRequestResponsePromiseType<ResponseData, ErrorData> = Promise<
  ApiRequestResponseType<ResponseData, ErrorData>
>;

export type ApiRequestOnDefaultCallback = (event: ProgressEvent<XMLHttpRequest>) => void;

export type ApiRequestOnStateChangeCallback = (event: Event) => void;

export type ApiRequestOnProgressCallback = (
  progressInfo: ApiRequestProgressInfo,
  event: ProgressEvent<XMLHttpRequest>,
) => void;

export type ApiRequestSuccessCallback<ResponseData> = (
  response: ApiRequestSuccessResponseType<ResponseData>,
) => void;

export type ApiRequestErrorCallback<ErrorData> = (
  response: ApiRequestErrorResponseType<ErrorData>,
) => void;

export type ApiRequestFinalCallback<ResponseData, ErrorData> = (
  result: ApiRequestResponseType<ResponseData, ErrorData>,
) => void;
