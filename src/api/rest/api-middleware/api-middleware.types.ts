import {
  NullableType,
  QueryParams,
  OmitObject,
  ObjectType,
  EmptyObjectType,
  ExtractEndpointParams,
} from "models";
import { ApiRequest, ApiRequestConfigType, ApiRequestHeaders } from "../api-request";

export type ApiMiddlewareConfig<
  E extends string,
  ErrorData,
  AuxiliaryKeys extends ObjectType = EmptyObjectType,
> = OmitObject<ApiRequestConfigType<ErrorData, AuxiliaryKeys>, "href" | "payload"> & {
  endpoint: E;
  baseUrl?: string;
  queryFormatter?: (query: QueryParams) => QueryParams;
};

export type ApiMiddlewareSettledQueryType = string | QueryParams;

export type ApiMiddlewareQueryParamsType<HasQuery extends true | false = false> =
  HasQuery extends true
    ? { queryParams?: ApiMiddlewareSettledQueryType }
    : { queryParams?: ApiMiddlewareSettledQueryType };

export type ApiMiddlewareParamsType<
  Params extends string,
  HasParams extends true | false = false,
> = ExtractEndpointParams<Params> extends NullableType
  ? { params?: undefined }
  : true extends HasParams
  ? { params?: undefined }
  : { params: ExtractEndpointParams<Params> };

export type ApiMiddlewareRequestDataType<
  RequestData,
  HasData extends true | false = false,
> = RequestData extends NullableType
  ? { data?: undefined }
  : HasData extends true
  ? { data?: undefined }
  : { data: RequestData };

export type ApiMiddlewareRequestHeadersType = {
  headers?: ApiRequestHeaders;
};

export type ApiMiddlewareFetchType<
  Params extends string,
  RequestData,
  HasData extends true | false,
  HasParams extends true | false,
  HasQuery extends true | false,
> = ApiMiddlewareQueryParamsType<HasQuery> &
  ApiMiddlewareParamsType<Params, HasParams> &
  ApiMiddlewareRequestDataType<RequestData, HasData> &
  ApiMiddlewareRequestHeadersType;

export type ApiMiddlewareFetchRequestType<
  Params extends string,
  RequestData,
  ResponseData,
  ErrorData,
  HasData extends true | false,
  HasParams extends true | false,
  HasQuery extends true | false,
> = ApiMiddlewareFetchType<
  Params,
  RequestData,
  HasData,
  HasParams,
  HasQuery
>["data"] extends NullableType
  ? ApiMiddlewareFetchType<
      Params,
      RequestData,
      HasData,
      HasParams,
      HasQuery
    >["params"] extends NullableType
    ? (
        options?: ApiMiddlewareFetchType<Params, RequestData, HasData, HasParams, HasQuery>,
      ) => ApiRequest<ResponseData, ErrorData>
    : (
        options: ApiMiddlewareFetchType<Params, RequestData, HasData, HasParams, HasQuery>,
      ) => ApiRequest<ResponseData, ErrorData>
  : (
      options: ApiMiddlewareFetchType<Params, RequestData, HasData, HasParams, HasQuery>,
    ) => ApiRequest<ResponseData, ErrorData>;
