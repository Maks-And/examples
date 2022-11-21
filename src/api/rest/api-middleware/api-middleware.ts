import { isFunction } from "utils/helpers/is-function";
import { merge } from "utils/helpers/merge";
import { queryParse } from "utils/string/query-parse";
import { queryStringify } from "utils/string/query-stringify";
import { isString } from "utils/string/is-string";
import {
  EmptyObjectType,
  Nullable,
  ObjectType,
  EndpointParamType,
  ExtractEndpointParams,
} from "models";
import { initialBuilderConfig } from "../api-builder/api-builder.constants";
import { ApiBuilderConfig } from "../api-builder";
import { ApiRequest, ApiRequestMiddlewareConfigType, ApiRequestHeaders } from "../api-request";
import {
  ApiMiddlewareConfig,
  ApiMiddlewareFetchRequestType,
  ApiMiddlewareFetchType,
  ApiMiddlewareSettledQueryType,
} from "./api-middleware.types";

export class ApiMiddleware<
  Params extends string,
  ResponseData = undefined,
  RequestData = undefined,
  ErrorData = undefined,
  HasData extends true | false = false,
  HasParams extends true | false = false,
  HasQuery extends true | false = false,
  AuxiliaryKeys extends ObjectType = EmptyObjectType,
> {
  public readonly id: number;

  private readonly _builderConfig: ApiBuilderConfig<ErrorData>;
  private readonly _middlewareConfig: ApiMiddlewareConfig<Params, ErrorData>;

  private _settledData: Nullable<RequestData>;
  private _settledParams: Nullable<ExtractEndpointParams<Params>>;
  private _settledQuery: Nullable<ApiMiddlewareSettledQueryType>;
  private _settledHeaders: ApiRequestHeaders = {};

  private _requestConfig(): ApiRequestMiddlewareConfigType<ErrorData, AuxiliaryKeys> {
    const builderHeaders = merge(this._builderConfig.headers || {}, this._settledHeaders);
    const middlewareHeaders = this._middlewareConfig.headers;
    const headers = isFunction(middlewareHeaders)
      ? middlewareHeaders(builderHeaders)
      : middlewareHeaders || builderHeaders;

    const builderRequestInterceptors = this._builderConfig.requestInterceptors || [];
    const middlewareRequestInterceptors = this._middlewareConfig.requestInterceptors || [];
    const requestInterceptors = builderRequestInterceptors.concat(middlewareRequestInterceptors);

    const builderResponseInterceptors = this._builderConfig.responseInterceptors || [];
    const middlewareResponseInterceptors = this._middlewareConfig.responseInterceptors || [];
    const responseInterceptors = builderResponseInterceptors.concat(middlewareResponseInterceptors);

    return {
      tokenPrefix:
        this._middlewareConfig.tokenPrefix || this._builderConfig.tokenPrefix || "Bearer",
      responseType:
        this._middlewareConfig.responseType || this._builderConfig.responseType || "json",
      timeout: this._middlewareConfig.timeout || 0,
      cors: this._middlewareConfig.cors ?? false,
      isFormData: this._middlewareConfig.isFormData ?? false,
      abortOnFetch: this._middlewareConfig.abortOnFetch ?? true,
      disableInterception: this._middlewareConfig.disableInterception ?? false,
      headers,
      auxiliaryKeys: this._middlewareConfig.auxiliaryKeys,
      tokenCallback: this._middlewareConfig.tokenCallback || this._builderConfig.tokenCallback,
      errorMapper: this._middlewareConfig.errorMapper || this._builderConfig.errorMapper,
      requestInterceptors,
      responseInterceptors,
    };
  }

  constructor(
    apiConfig: ApiMiddlewareConfig<Params, ErrorData, AuxiliaryKeys>,
    builderConfig?: ApiBuilderConfig,
  ) {
    this.id = ApiMiddleware._getId();

    this._builderConfig = Object.assign(builderConfig ?? {}, {
      baseUrl: "",
      ...initialBuilderConfig,
      ...builderConfig,
    });

    this._middlewareConfig = apiConfig;
  }

  public clone(): ApiMiddleware<
    Params,
    ResponseData,
    RequestData,
    ErrorData,
    HasData,
    HasParams,
    HasQuery
  > {
    const cloned = new ApiMiddleware<
      Params,
      ResponseData,
      RequestData,
      ErrorData,
      HasData,
      HasParams,
      HasQuery
    >(this._middlewareConfig, this._builderConfig);
    --ApiMiddleware._id;
    // getRequest MUST be omitted!!!! and not passed to new instance
    const { getRequest: _, ...rest } = this;
    return Object.assign(cloned, rest);
  }

  public setData(
    data: RequestData,
  ): ApiMiddleware<Params, ResponseData, RequestData, ErrorData, true, HasParams, HasQuery> {
    const cloned = this.clone();
    cloned._settledData = data;
    return cloned as any;
  }

  public setParams(
    params: ApiMiddlewareFetchType<Params, RequestData, HasData, HasParams, HasQuery>["params"],
  ): ApiMiddleware<Params, ResponseData, RequestData, ErrorData, HasData, true, HasQuery> {
    const cloned = this.clone();
    cloned._settledParams = params;
    return cloned as any;
  }

  public setQueryParams(
    queryParams?: ApiMiddlewareSettledQueryType,
  ): ApiMiddleware<Params, ResponseData, RequestData, ErrorData, HasData, HasParams, true> {
    const cloned = this.clone();
    cloned._settledQuery = queryParams;
    return cloned as any;
  }

  public setHeaders(
    headers: ApiRequestHeaders,
  ): ApiMiddleware<Params, ResponseData, RequestData, ErrorData, HasData, HasParams, true> {
    const cloned = this.clone();
    cloned._settledHeaders = headers;
    return cloned as any;
  }

  // @ts-ignore
  public getRequest: ApiMiddlewareFetchRequestType<
    Params,
    RequestData,
    ResponseData,
    ErrorData,
    HasData,
    HasParams,
    HasQuery
  > = (
    options: ApiMiddlewareFetchType<Params, RequestData, HasData, HasParams, HasQuery>,
  ): ApiRequest<ResponseData, ErrorData> => {
    const cloned = this.clone();

    const baseUrl = cloned._middlewareConfig.baseUrl || cloned._builderConfig.baseUrl;
    const params = cloned._settledParams || options?.params || null;
    const endpoint = cloned._handleMapEndpointParams(params);
    const fullUrl = baseUrl + endpoint;

    let queryParams = cloned._settledQuery || options?.queryParams || "";
    queryParams = isString(queryParams) ? queryParams : queryStringify(queryParams);
    if (cloned._middlewareConfig.queryFormatter) {
      queryParams = queryStringify(
        cloned._middlewareConfig.queryFormatter(queryParse(queryParams)),
      );
    }

    if (options?.headers) {
      cloned._settledHeaders = options.headers;
    }

    const href = fullUrl + queryParams;

    const method = cloned._middlewareConfig.method;

    const payload = cloned._settledData || options?.data || null;

    const config = cloned._requestConfig.bind(cloned);
    Object.defineProperty(config, "middlewareId", { value: this.id });

    return new ApiRequest<ResponseData, ErrorData>(
      {
        href,
        method,
        payload,
      },
      config,
    );
  };

  private _handleMapEndpointParams(params: Nullable<ObjectType<EndpointParamType>>): string {
    let endpoint: string = this._middlewareConfig.endpoint;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        endpoint = endpoint.replace(new RegExp(`:${key}`, "g"), String(value));
      });
    }
    return endpoint;
  }

  private static _id = 0;

  private static _getId() {
    return ++this._id;
  }
}

export default ApiMiddleware;
