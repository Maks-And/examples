import { ApiMiddleware, ApiRequestResponseType } from "api";

export type PaginationList<T> = {
  filtered_items: number;
  total_items: number;
  rows: T extends any[] ? T : T[];
};

export type ExtractPaginationList<T> = T extends PaginationList<infer X> ? X : never;

export type ApiResponsePaginationList<T> = ExtractPaginationList<T>[];

export type ExtractApiParams<T> = T extends ApiMiddleware<infer D, any, any, any, any, any, any>
  ? D
  : never;

export type ExtractApiResponse<T> = T extends ApiMiddleware<any, infer D, any, any, any, any, any>
  ? D
  : never;

export type ExtractApiRequest<T> = T extends ApiMiddleware<any, any, infer D, any, any, any, any>
  ? D
  : never;

export type ExtractApiError<T> = T extends ApiMiddleware<any, any, any, infer D, any, any, any>
  ? D
  : never;

export type ExtractApiHasData<T> = T extends ApiMiddleware<any, any, any, any, infer D, any, any>
  ? D
  : never;

export type ExtractApiHasParams<T> = T extends ApiMiddleware<any, any, any, any, any, infer D, any>
  ? D
  : never;

export type ExtractApiHasQuery<T> = T extends ApiMiddleware<any, any, any, any, any, any, infer D>
  ? D
  : never;

export type ExtractApiResponseType<T extends ApiMiddleware<any, any, any, any, any, any, any>> =
  T extends ApiMiddleware<any, infer R, infer D, any, any, any, any>
    ? ApiRequestResponseType<R, D>
    : never;

export type ExtractApiAuxiliaryKeys<T> = T extends ApiMiddleware<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  infer D
>
  ? D
  : never;
