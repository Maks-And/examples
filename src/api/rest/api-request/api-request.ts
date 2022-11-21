import { DateArgument, EmptyObjectType, NonNullableKeysExcept, ObjectType } from "models";
import { EventEmitter } from "utils/helpers/classes/event-emitter";
import { isFunction } from "utils/helpers/is-function";
import { JSONParse } from "utils/helpers/json-parse";
import { isNullable } from "utils/helpers/is-nullable";
import { clamp } from "utils/math/clamp";
import { isFinitePositive } from "utils/math/is-finite-positive";
import { round } from "utils/math/round";
import { getJSDate } from "utils/dates/get-js-date";
import {
  ApiRequestConfigType,
  ApiRequestHeaders,
  ApiRequestProgressInfo,
  ApiRequestSendData,
  ApiRequestEmitter,
  ApiRequestSuccessResponse,
  ApiRequestDetailsResponse,
  ApiRequestErrorResponse,
  ApiRequestSuccessResponseType,
  ApiRequestErrorResponseType,
  ApiRequestResponseType,
  ApiRequestErrorStatusType,
  ApiRequestResponsePromiseType,
  ApiRequestMiddlewareConfigType,
} from "./api-request.types";
import { ApiMiddleware } from "../api-middleware";

export class ApiRequest<
  ResponseData = undefined,
  ErrorData = undefined,
  AuxiliaryKeys extends ObjectType = EmptyObjectType,
> {
  private readonly _xhr = new XMLHttpRequest();

  private readonly _emitter = new EventEmitter<ApiRequestEmitter<ResponseData, ErrorData>>();

  public get events() {
    return this._emitter.events;
  }

  public readonly requestConfig: ApiRequestConfigType<ErrorData, AuxiliaryKeys>;
  private readonly _middlewareConfig?: () => ApiRequestMiddlewareConfigType<
    ErrorData,
    AuxiliaryKeys
  >;

  private _loading = false;

  private _requestStartTimestamp: number | null = null;
  private _responseStartTimestamp: number | null = null;

  private get _config(): NonNullableKeysExcept<
    ApiRequestConfigType<ErrorData, AuxiliaryKeys>,
    "payload" | "headers" | "tokenCallback" | "errorMapper"
  > {
    return {
      tokenPrefix: "Bearer",
      responseType: "json",
      timeout: 0,
      cors: false,
      isFormData: false,
      abortOnFetch: true,
      disableInterception: false,
      auxiliaryKeys: {},
      requestInterceptors: [],
      responseInterceptors: [],
      ...this._middlewareConfig?.(),
      ...this.requestConfig,
    };
  }

  public get auxiliaryKeys(): Partial<AuxiliaryKeys> {
    return this.requestConfig.auxiliaryKeys || this._middlewareConfig?.().auxiliaryKeys || {};
  }

  private get _isFormData() {
    return this._config.payload instanceof FormData || this._config.isFormData;
  }

  constructor(
    requestConfig: ApiRequestConfigType<ErrorData, AuxiliaryKeys>,
    middlewareConfig?: () => ApiRequestMiddlewareConfigType<ErrorData, AuxiliaryKeys>,
  ) {
    this.requestConfig = requestConfig;
    this._middlewareConfig = middlewareConfig;
  }

  public clone() {
    return new ApiRequest<ResponseData, ErrorData, AuxiliaryKeys>(
      this.requestConfig,
      this._middlewareConfig,
    );
  }

  public abort() {
    this._xhr.abort();
  }

  public createdBy(
    ...middlewares: ApiMiddleware<any, any, any, any, any, any, any, any>[]
  ): boolean {
    const config = this._middlewareConfig;

    if (!config) return false;

    const hiddenId = (config as any)?.["middlewareId"];

    if (!hiddenId) return false;

    return middlewares.some((middleware) => {
      return middleware.id === hiddenId;
    });
  }

  public fetch(): ApiRequestResponsePromiseType<ResponseData, ErrorData> {
    return new Promise((resolve, reject) => {
      if (!this._config.abortOnFetch && this._loading) {
        console.warn(
          `Fetch have been already called before and not yet finished due to ApiRequest "abortOnFetch" set to "false" as configuration parameter.\n` +
            'Consider either to catch such error, or to set it this option to "true"',
        );
        return reject("abortOnFetch");
      }

      if (this._config.abortOnFetch && this._loading) this.abort();

      this._xhr.open(this._config.method.toUpperCase(), this._config.href.toString());
      this._setupRequest();
      this._setupHeaders();

      // Request listeners group ↓
      this._xhr.upload.onerror = (e) => {
        this._handleFetchError(e as ProgressEvent<XMLHttpRequest>, resolve);
      };

      this._xhr.upload.onabort = (e) => {
        this._handleFetchError(e as ProgressEvent<XMLHttpRequest>, resolve, true);
      };

      this._xhr.upload.ontimeout = (e) => {
        this._handleFetchError(e as ProgressEvent<XMLHttpRequest>, resolve, false, true);
      };

      this._xhr.upload.onprogress = (e) => {
        const event = e as ProgressEvent<XMLHttpRequest>;
        const progressInfo = ApiRequest._handleProgressInfo(
          event,
          this._responseStartTimestamp ?? new Date(),
        );
        this._emitter.emit("requestProgress", progressInfo, event);
      };

      this._xhr.upload.onloadstart = (e) => {
        this._requestStartTimestamp = +new Date();
        this._emitter.emit("requestStart", e as ProgressEvent<XMLHttpRequest>);
      };

      this._xhr.upload.onloadend = () => {
        this._requestStartTimestamp = null;
      };

      // Response listeners group ↓
      this._xhr.onreadystatechange = (e) => {
        if (this._xhr.readyState === 2) {
          const isSuccess = /^[23]/.test(this._xhr.status.toString());
          const contentType = this._xhr.getResponseHeader("content-type");

          if (!isSuccess && contentType?.includes("text/plain")) {
            this._xhr.responseType = "text";
          }
        }

        this._emitter.emit("responseStatusChange", e);
      };

      this._xhr.onerror = (e) => {
        this._handleFetchError(e as ProgressEvent<XMLHttpRequest>, resolve);
      };

      this._xhr.onabort = (e) => {
        this._handleFetchError(e as ProgressEvent<XMLHttpRequest>, resolve, true);
      };

      this._xhr.ontimeout = (e) => {
        this._handleFetchError(e as ProgressEvent<XMLHttpRequest>, resolve, false, true);
      };

      this._xhr.onprogress = (e) => {
        const event = e as ProgressEvent<XMLHttpRequest>;
        const progressInfo = ApiRequest._handleProgressInfo(
          event,
          this._responseStartTimestamp ?? new Date(),
        );
        this._emitter.emit("responseProgress", progressInfo, event);
      };

      this._xhr.onloadstart = (e) => {
        this._responseStartTimestamp = +new Date();
        this._emitter.emit("responseStart", e as ProgressEvent<XMLHttpRequest>);
      };

      this._xhr.onloadend = (e) => {
        const event = e as ProgressEvent<XMLHttpRequest>;
        if (!event.target) return;

        if (/^[23]/.test(event.target.status.toString())) {
          this._handleFetchSuccess(event, resolve);
        } else {
          this._handleFetchError(event, resolve);
        }
      };

      this._loading = true;
      this._xhr.send(this._setupData());
    });
  }

  private _getFetchStatusTime(): ApiRequestDetailsResponse["time"] {
    const finishTime = +new Date();
    const startTime = this._responseStartTimestamp ?? +new Date();
    const delta = finishTime - startTime;
    return { startTime, finishTime, delta };
  }

  private async _handleFetchSuccess(
    event: ProgressEvent<XMLHttpRequest>,
    resolve: (data: ApiRequestResponseType<ResponseData, ErrorData>) => void,
  ) {
    if (!event.target) return;

    const { status } = event.target;
    let response = event.target.response;

    if (
      event.target.responseType === "text" &&
      (this._config.responseType === "json" || this._config.responseType === "json-text")
    ) {
      response = JSONParse(response, response);
    }

    const successResponse: ApiRequestSuccessResponse<ResponseData> = response;

    let apiData: ApiRequestSuccessResponseType<ResponseData> = {
      success: successResponse,
      error: null,
      status: "success",
      details: {
        status: "success",
        statusCode: status,
        isCanceled: false,
        isTimeout: false,
        isSuccess: true,
        time: this._getFetchStatusTime(),
      },
      event,
    };

    if (!this._config.disableInterception && this._config.responseInterceptors) {
      for await (const interceptor of this._config.responseInterceptors) {
        apiData = (await interceptor(apiData, this as any)) as any;
      }
    }

    this._responseStartTimestamp = null;
    this._loading = false;

    this._emitter.emit("success", apiData);
    this._emitter.emit("final", apiData);

    this._emitter.offAll();

    resolve(apiData);
  }

  private async _handleFetchError(
    event: ProgressEvent<XMLHttpRequest>,
    resolve: (data: ApiRequestResponseType<ResponseData, ErrorData>) => void,
    isCanceled = false,
    isTimeout = false,
  ) {
    if (!event.target) return;

    const { status } = event.target;
    let response = event.target.response;

    if (
      event.target.responseType === "text" &&
      (this._config.responseType === "json" || this._config.responseType === "json-text")
    ) {
      response = JSONParse(response, response);
    }

    const exceptionalError = isCanceled
      ? "Request was cancelled"
      : isTimeout
      ? "Request was ended due to timeout"
      : null;

    const statusCode = status || 0;

    const errorStatus: ApiRequestErrorStatusType = isCanceled
      ? "cancelled"
      : isTimeout
      ? "timeout"
      : statusCode
      ? "error"
      : "none";

    const errorResponse: ApiRequestErrorResponse<ErrorData> = {
      originalError: exceptionalError ?? response,
      formattedMessage: exceptionalError ?? this._config.errorMapper?.(response) ?? "Server Error",
      status: errorStatus,
      statusCode,
    };

    let apiData: ApiRequestErrorResponseType<ErrorData> = {
      success: null,
      error: errorResponse,
      status: errorStatus,
      details: {
        status: errorStatus,
        statusCode,
        isCanceled,
        isTimeout,
        isSuccess: false,
        time: this._getFetchStatusTime(),
      },
      event,
    };

    if (!this._config.disableInterception && this._config.responseInterceptors) {
      for await (const interceptor of this._config.responseInterceptors) {
        apiData = (await interceptor(apiData, this as any)) as any;
      }
    }

    this._responseStartTimestamp = null;
    this._loading = false;

    this._emitter.emit("error", apiData);
    this._emitter.emit("final", apiData);

    this._emitter.offAll();

    resolve(apiData);
  }

  private _setupRequest() {
    const { cors, timeout, responseType } = this._config;
    this._xhr.withCredentials = cors;
    if (isFinitePositive(timeout)) this._xhr.timeout = timeout;
    this._xhr.responseType = responseType === "json-text" ? "text" : responseType;
  }

  private _setupHeaders() {
    const { tokenPrefix, tokenCallback, disableInterception, requestInterceptors, responseType } =
      this._config;

    let headersToSet: ApiRequestHeaders = {};

    const token = tokenCallback?.();
    if (token) headersToSet["authorization"] = `${tokenPrefix} ${token}`;

    if (!this._isFormData && responseType === "json") {
      headersToSet["content-type"] = "application/json";
    }

    headersToSet = {
      ...headersToSet,
      ...(this._middlewareConfig?.()?.headers || {}),
    };

    const requestHeaders = this.requestConfig.headers;

    let finalHeaders = isFunction(requestHeaders)
      ? requestHeaders(headersToSet)
      : requestHeaders || headersToSet;

    if (!disableInterception && requestInterceptors) {
      for (const interceptor of requestInterceptors) {
        finalHeaders = interceptor(this.auxiliaryKeys, finalHeaders);
      }
    }

    const headers = new Headers(finalHeaders);

    headers.forEach((value, key) => {
      if (value === "") return;
      this._xhr.setRequestHeader(key, value);
    });
  }

  private _setupData(): ApiRequestSendData {
    const payload = this._config.payload;

    const isPayloadFormData = payload instanceof FormData;
    if (isPayloadFormData) return payload;

    if (!isPayloadFormData && this._config.isFormData) {
      throw new TypeError(`ApiRequest config has isFormData set to "true",
      but payload passed isn't instance of FormData,
      please provide valid payload for correct request configuration
      `);
    }

    if (isNullable(payload)) return undefined;

    return JSON.stringify(payload);
  }

  private static _handleProgressInfo(
    event: ProgressEvent<XMLHttpRequest>,
    startDate: DateArgument,
  ): ApiRequestProgressInfo {
    const loadedSize = event.loaded;
    const totalSize = event.total;
    const canCompute = event.lengthComputable;
    if (!canCompute) {
      return {
        progress: -1,
        etaTime: -1,
        etaSize: -1,
        loadedSize,
        totalSize: -1,
        etaSpeed: -1,
      };
    }

    const progress = round(clamp((loadedSize / totalSize) * 100, 0, 100), 2);

    const timeElapsed = +new Date() - +getJSDate(startDate);
    const uploadSpeed = loadedSize / timeElapsed;

    const etaSize = totalSize - loadedSize;
    const etaTime = etaSize / uploadSpeed;
    const etaSpeed = uploadSpeed * 1000;

    return { progress, etaTime, etaSize, loadedSize, totalSize, etaSpeed };
  }
}
