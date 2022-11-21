import { EmptyObjectType, MaybeArray, ObjectType } from "models";
import { JSONStringify } from "utils/helpers/json-stringify";
import { isNullable } from "utils/helpers/is-nullable";
import { isString } from "utils/string/is-string";
import { ApiMiddleware, ApiMiddlewareConfig } from "../api-middleware";
import {
  ApiRequestTokenCallback,
  ApiRequestErrorMapperCallback,
  ApiRequestRequestInterceptorCallback,
  ApiRequestResponseInterceptorCallback,
} from "../api-request";
import { initialBuilderConfig } from "./api-builder.constants";
import { ApiBuilderConfig } from "./api-builder.types";

export class ApiBuilder<ErrorType = any, AuxiliaryKeys extends ObjectType = EmptyObjectType> {
  public builderConfig: ApiBuilderConfig<ErrorType, AuxiliaryKeys>;

  private _errorMapper: ApiRequestErrorMapperCallback<any> = (error) => {
    const maybeMessage = error?.message || error?.formattedMessage || error?.msg;
    if (isString(maybeMessage)) return maybeMessage;
    if (isNullable(error)) return "Server Error";
    return JSONStringify(error, "Server Error");
  };

  constructor(config: ApiBuilderConfig<ErrorType, AuxiliaryKeys>) {
    // Here we can do some baseUrl check, eg if it's valid http/s uri, etc.
    if (!config.baseUrl.trim()) {
      throw new Error(`Invalid baseUrl passed to ApiBuilder: "${config.baseUrl}"`);
    }

    this.builderConfig = {
      ...initialBuilderConfig,
      errorMapper: this._errorMapper,
      ...config,
    };
  }

  public setRequestInterceptors(
    callback: MaybeArray<ApiRequestRequestInterceptorCallback<AuxiliaryKeys>>,
  ): ApiBuilder<ErrorType, AuxiliaryKeys> {
    const interceptors = this.builderConfig.requestInterceptors || [];
    this.builderConfig.requestInterceptors = interceptors.concat(callback);
    return this;
  }

  public setResponseInterceptors(
    callback: MaybeArray<ApiRequestResponseInterceptorCallback>,
  ): ApiBuilder<ErrorType, AuxiliaryKeys> {
    const interceptors = this.builderConfig.responseInterceptors || [];
    this.builderConfig.responseInterceptors = interceptors.concat(callback);
    return this;
  }

  public setErrorMapper<R extends ErrorType = ErrorType>(
    callback: ApiRequestErrorMapperCallback<R>,
  ): ApiBuilder<R, AuxiliaryKeys> {
    this.builderConfig.errorMapper = callback as any;
    return this;
  }

  public setTokenCallback(callback: ApiRequestTokenCallback | undefined) {
    this.builderConfig.tokenCallback = callback;
  }

  public build() {
    return <
      ResponseData = undefined,
      RequestData = undefined,
      ErrorData = ErrorType,
      Keys = AuxiliaryKeys,
    >() => {
      return <Params extends string>(params: ApiMiddlewareConfig<Params, ErrorData, Keys>) => {
        return new ApiMiddleware<
          Params,
          ResponseData,
          RequestData,
          ErrorData,
          false,
          false,
          false,
          Keys
        >(params, this.builderConfig);
      };
    };
  }
}

export default ApiBuilder;
